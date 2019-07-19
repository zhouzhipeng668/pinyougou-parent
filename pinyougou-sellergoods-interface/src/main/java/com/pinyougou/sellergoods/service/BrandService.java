package com.pinyougou.sellergoods.service;

import com.pinyougou.pojo.TbBrand;
import entity.PageResult;

import java.util.List;
import java.util.Map;

/**
 * 品牌接口
 * @author Administrator
 *
 */
public interface BrandService {
	//查询全部
	public List<TbBrand> findAll();
	public PageResult findPage(int pageNum, int pageSize);
	//增加
	public void add(TbBrand brand);
	//查询
	public TbBrand findOne(Long id);
	//修改
	public void update(TbBrand brand);
	//删除
	public void dele(Long[] ids);
	//条件查询
	public PageResult findPage(TbBrand brand, int pageNum, int pageSize);
	//下拉列表
	public List<Map> selectOptionList();


}
