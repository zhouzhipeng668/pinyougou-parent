package com.pinyougou.cart.service.impl;

import com.alibaba.dubbo.config.annotation.Service;
import com.pinyougou.cart.service.CartService;
import com.pinyougou.mapper.TbItemMapper;
import com.pinyougou.pojo.TbItem;
import com.pinyougou.pojo.TbOrderItem;
import com.pinyougou.pojogroup.Cart;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class CartServiceImpl implements CartService{

    @Autowired
    private TbItemMapper itemMapper;
    @Override
    public List<Cart> addGoodsToCartList(List<Cart> cartList, Long itemId, Integer num) {

        TbItem item = itemMapper.selectByPrimaryKey(itemId);
        if(item==null){
            throw  new RuntimeException("商品不存在!");
        }
        if(!item.getStatus().equals("1")){
            throw new RuntimeException("商品状态无效!");
        }
        //获取商家ID
        String sellerId = item.getSellerId();
        //3.根据商家ID判断购物车列表中是否存在该商家的购物车
        Cart cart = searchCartBySellerId(cartList, sellerId);
        //4.如果购物车列表中不存在该商家的购物车
        if(cart==null){
            //4.1创建购物车
            cart = new Cart();
            cart.setSellerId(sellerId);
            cart.setSellerName(item.getSeller());
            TbOrderItem orderItem = createOrderItem(item,num);
            //添加商品列表
            List orderItemList = new ArrayList();
            orderItemList.add(orderItem);
            cart.setOrderItemList(orderItemList);

            cartList.add(cart);
        }else{
            //购物车不为空,首先查询是否存在该商品
            TbOrderItem orderItem = searchOrderItemByItemId(cart.getOrderItemList(), itemId);
            if(orderItem==null){
                //如果没有该商品
               orderItem = createOrderItem(item,num);
               cart.getOrderItemList().add(orderItem);
            }else{
                //如果存在该商品则添加数量和价格
                orderItem.setNum(orderItem.getNum()+num);
                orderItem.setTotalFee(new BigDecimal(orderItem.getNum()*orderItem.getPrice().doubleValue()));
                if(orderItem.getNum()<=0){
                    //如果操作后数量小于0,则移除该商品选项
                    cart.getOrderItemList().remove(orderItem);
                }
                //如果删除商品选项后购物车为空,则删除购物车
                if(cart.getOrderItemList().size()==0){
                    cartList.remove(cart);
                }
            }
        }



        return cartList;
    }

    private Cart searchCartBySellerId(List<Cart> cartList,String sellerId){

        for(Cart cart:cartList){
            if(cart.getSellerId().equals(sellerId)){
                return cart;
            }
        }

        return null;

    }

    private TbOrderItem searchOrderItemByItemId(List<TbOrderItem> orderItemList,Long itemId){
        for(TbOrderItem orderItem:orderItemList){
            if(orderItem.getItemId().longValue()==itemId.longValue()){
                return orderItem;
            }
        }
        return null;
    }

    private TbOrderItem createOrderItem(TbItem item,Integer num){
        if(num<=0){
            throw  new RuntimeException("数量非法!");
        }
        TbOrderItem orderItem = new TbOrderItem();
        orderItem.setGoodsId(item.getGoodsId());
        orderItem.setItemId(item.getId());
        orderItem.setNum(num);
        orderItem.setPicPath(item.getImage());
        orderItem.setPrice(item.getPrice());
        orderItem.setSellerId(item.getSellerId());
        orderItem.setTitle(item.getTitle());
        orderItem.setTotalFee(new BigDecimal(item.getPrice().doubleValue()*num));

        return orderItem;
    }
    @Autowired
    private RedisTemplate redisTemplate;


    @Override
    public void saveCartListToRedis(String username, List<Cart> cartList) {
        redisTemplate.boundHashOps("cartList").put(username,cartList);
    }

    @Override
    public List<Cart> mergeCartList(List<Cart> cartList1, List<Cart> cartList2) {
        for(Cart cart: cartList2){
            for(TbOrderItem orderItem:cart.getOrderItemList()){
                addGoodsToCartList(cartList1,orderItem.getItemId(),orderItem.getNum());
            }
        }

        return cartList1;
    }

    @Override
    public List<Cart> findCartListFromRedis(String username) {
        List<Cart> cartList = (List<Cart>) redisTemplate.boundHashOps("cartList").get(username);
        if(cartList==null){
            cartList=new ArrayList<>();
        }
        return cartList;
    }
}
