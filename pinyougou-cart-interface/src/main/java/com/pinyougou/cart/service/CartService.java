package com.pinyougou.cart.service;

import com.pinyougou.pojogroup.Cart;

import java.util.List;

/**
 * 购物车服务接口
 * @author Administrator
 *
 */
public interface CartService {

	//添加商品到购物车
	public List<Cart> addGoodsToCartList(List<Cart> cartList,Long itemId,Integer num );

	public List<Cart> findCartListFromRedis(String username);

	public void saveCartListToRedis(String username,List<Cart> cartList );

	public List<Cart> mergeCartList(List<Cart> cartList1,List<Cart> cartList2);

}
