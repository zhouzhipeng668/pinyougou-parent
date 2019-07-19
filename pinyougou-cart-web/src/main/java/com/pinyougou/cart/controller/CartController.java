package com.pinyougou.cart.controller;

import com.alibaba.dubbo.config.annotation.Reference;
import com.alibaba.fastjson.JSON;
import com.pinyougou.cart.service.CartService;
import com.pinyougou.pojogroup.Cart;
import entity.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import util.CookieUtil;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.List;

@RestController
@RequestMapping("/cart")
public class CartController {

    @Reference(timeout=100000)
    private CartService cartService;

    @Autowired
    private HttpServletRequest request;

    @Autowired
    private HttpServletResponse response;


    @RequestMapping("/findCartList")
    public List<Cart> findCartList() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        System.out.println("当前等陆人:" + username);
        String cartListString = CookieUtil.getCookieValue(request, "cartList", "UTF-8");
        if (cartListString == null || cartListString.equals("")) {
            cartListString = "[]";
        }
        List<Cart> cartList_cookie = JSON.parseArray(cartListString, Cart.class);
        if (username.equals("anonymousUser")) {
            System.out.println("从cookie中提取购物车");

            return cartList_cookie;
        } else {
            System.out.println("从redis中提取购物车");
            List<Cart> cartList_redis = cartService.findCartListFromRedis(username);
            if(cartList_cookie.size()>0){
                //获取合并购物车
                List<Cart> cartList = cartService.mergeCartList(cartList_cookie, cartList_redis);
                cartService.saveCartListToRedis(username,cartList);
                //清除本地购物车
                CookieUtil.deleteCookie(request,response,"cartList");
                System.out.println("执行了合并购物车逻辑");
                return cartList;
            }
            return cartList_redis;
        }



    }

    @RequestMapping("/addGoodsToCartList")
    @CrossOrigin(origins = "http://localhost:9105",allowCredentials = "true")
    public Result addGoodsToCartList(Long itemId, Integer num) {

        //response.setHeader("Access-Control-Allow-Origin", "http://localhost:9105");
       // response.setHeader("Access-Control-Allow-Credentials", "true");


        String name = SecurityContextHolder.getContext().getAuthentication().getName();
        System.out.println("当前登陆人:" + name);

        try {
            List<Cart> cartList = findCartList();
            cartList=cartService.addGoodsToCartList(cartList,itemId,num);
            if(name.equals("anonymousUser")){
                CookieUtil.setCookie(request,response,"cartList",JSON.toJSONString(cartList),3600*24,"UTF-8");
                System.out.println("向cookie存储购物车");
            }else{
                cartService.saveCartListToRedis(name,cartList);
                System.out.println("向redis存储购物车");
            }
            return  new Result(true,"添加成功!");
        } catch (Exception e) {
            e.printStackTrace();
            return new Result(false,"添加失败!");
        }

    }



}
