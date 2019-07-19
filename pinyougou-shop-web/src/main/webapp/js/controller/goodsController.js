 //控制层 
app.controller('goodsController' ,function($scope,$controller,$location,goodsService,uploadService,itemCatService,typeTemplateService){
	
	$controller('baseController',{$scope:$scope});//继承
	
    //读取列表数据绑定到表单中  
	$scope.findAll=function(){
		goodsService.findAll().success(
			function(response){
				$scope.list=response;
			}			
		);
	}    
	
	//分页
	$scope.findPage=function(page,rows){			
		goodsService.findPage(page,rows).success(
			function(response){
				$scope.list=response.rows;	
				$scope.paginationConf.totalItems=response.total;//更新总记录数
			}			
		);
	}
	
	//查询实体 
	$scope.findOne=function(){
		var id = $location.search()['id'];
		if(id==null){
			return;
		}
		goodsService.findOne(id).success(
			function(response){
				$scope.entity= response;
				//商品介绍
				editor.html($scope.entity.goodsDesc.introduction);
				//商品图片
                $scope.entity.goodsDesc.itemImages=JSON.parse($scope.entity.goodsDesc.itemImages);
                //附加属性
                $scope.entity.goodsDesc.customAttributeItems=JSON.parse($scope.entity.goodsDesc.customAttributeItems);
                //规格
                $scope.entity.goodsDesc.specificationItems=JSON.parse($scope.entity.goodsDesc.specificationItems);
                //sku(因为规格选项是一个集合,所以要循环转换)
                for(var i=0;i< $scope.entity.itemList.length;i++ ){
                	$scope.entity.itemList[i].spec= JSON.parse($scope.entity.itemList[i].spec);
                }


            }
		);				
	}
	//读取规格属性
	$scope.checkAttributeValue=function(specName,optionName){
       var list = $scope.entity.goodsDesc.specificationItems;
       //获取规格集合
       var object = $scope.searchObjectByKey(list,'attributeName',specName);
       if(object==null){
       	return false;
	   }else {
       	//判断是否存在规格属性
       	if(object.attributeValue.indexOf(optionName)>=0){
       		return true;
		}else {
       		return false;
		}

	   }
	}

	//保存 
	$scope.save=function(){
        $scope.entity.goodsDesc.introduction=editor.html();
		var serviceObject;//服务层对象  				
		if($scope.entity.goods.id!=null){//如果有ID
			serviceObject=goodsService.update( $scope.entity ); //修改  
		}else{
			serviceObject=goodsService.add( $scope.entity  );//增加 
		}				
		serviceObject.success(
			function(response){
				if(response.success){
                    alert("新增成功");
                   location.href="goods.html";
				}else{
					alert(response.message);
				}
			}		
		);				
	}
	

	
	 
	//批量删除 
	$scope.dele=function(){			
		//获取选中的复选框			
		goodsService.dele( $scope.selectIds ).success(
			function(response){
				if(response.success){
					$scope.reloadList();//刷新列表
					$scope.selectIds=[];
				}						
			}		
		);				
	}
	
	$scope.searchEntity={};//定义搜索对象 
	
	//搜索
	$scope.search=function(page,rows){			
		goodsService.search(page,rows,$scope.searchEntity).success(
			function(response){
				$scope.list=response.rows;	
				$scope.paginationConf.totalItems=response.total;//更新总记录数
			}			
		);
	}
	
	//上传图片
	$scope.uploadFile=function(){
		uploadService.uploadFile().success(
			function(response){
				if(response.success){
					$scope.image_entity.url= response.message;
				}else{
					alert(response.message);					
				}
			}		
		);


	}

    $scope.entity={ goodsDesc:{itemImages:[],specificationItems:[]}};
	
	//添加图片列表
	$scope.add_image_entity=function(){
		$scope.entity.goodsDesc.itemImages.push($scope.image_entity);			
	}
	
	//删除图片
	$scope.remove_image_entity=function(index){
		$scope.entity.goodsDesc.itemImages.splice(index,1);
	}
	//一级分类下拉列表
	$scope.selectItemCat1List=function () {
		itemCatService.findByParentId(0).success(
			function (response) {
				$scope.itemCat1List=response;
            }
		)
    }
    //显示二级
	$scope.$watch('entity.goods.category1Id',function (newValue,oldValue) {
        itemCatService.findByParentId(newValue).success(
            function (response) {
                $scope.itemCat2List=response;
            }
        )
	})
    //显示三级
    $scope.$watch('entity.goods.category2Id',function (newValue,oldValue) {
        itemCatService.findByParentId(newValue).success(
            function (response) {
                $scope.itemCat3List=response;
            }
        )
    })
	//显示模板ID
    $scope.$watch('entity.goods.category3Id',function (newValue,oldValue) {
       itemCatService.findOne(newValue).success(
       	function (response) {
            $scope.entity.goods.typeTemplateId=response.typeId;
        }
	   )
    })
	//显示品牌下来列表
	$scope.$watch('entity.goods.typeTemplateId',function (newValue,oldValue) {
		typeTemplateService.findOne(newValue).success(
			function (response) {
				$scope.typeTemplate=response;
				$scope.typeTemplate.brandIds=JSON.parse($scope.typeTemplate.brandIds);
				//显示扩展属性
				if($location.search()['id']==null){
                    $scope.entity.goodsDesc.customAttributeItems= JSON.parse($scope.typeTemplate.customAttributeItems);
				}

            }
		)
		typeTemplateService.findSpecList(newValue).success(
			function (response) {
				$scope.specList=response;
            }
		)
	})

	//选中规格列表集合
	 $scope.updateSpecAttribute=function($event,name,value){
		 var object= $scope.searchObjectByKey(
			 $scope.entity.goodsDesc.specificationItems,'attributeName',name);
		 if(object!=null){
			 if($event.target.checked ){
				 object.attributeValue.push(value);
			 }else{
			 	 //取消勾选,移除value
				 object.attributeValue.splice(object.attributeValue.indexOf(value),1);
				 //如果选项都取消了，将此条记录移除
				 if(object.attributeValue.length==0){
					 $scope.entity.goodsDesc.specificationItems.splice($scope.entity.goodsDesc.specificationItems.indexOf(object),1);
				 }
			 }
		 }else{
			 $scope.entity.goodsDesc.specificationItems.push(
				 {"attributeName":name,"attributeValue":[value]});
		 }
	 }
	 //创建sku列表
	$scope.createItemList=function () {
		//初始化
		$scope.entity.itemList=[{spec:{},price:0,num:99999,status:'0',isDefault:'0' }];
		//添加列表
		var items = $scope.entity.goodsDesc.specificationItems;
        for (var i = 0; i < items.length; i++) {
            $scope.entity.itemList=addColumn($scope.entity.itemList,items[i].attributeName,items[i].attributeValue);
        }
    }
    //添加列表的方法
	addColumn=function (list,columnName,columnValue) {
		var newList=[];
        for (var i = 0; i <list.length ; i++) {
        	//老的一行
			var oldRow=list[i];
            for (var j = 0; j <columnValue.length ; j++) {
				//深克隆
				var newRow = JSON.parse(JSON.stringify(oldRow));
				newRow.spec[columnName]=columnValue[j];
				newList.push(newRow);
            }
        }
        return newList;
    }
    //状态ID改文字
	$scope.status=["未审核","已审核","审核未通过","已关闭"];
	//分类ID改文字
	$scope.itemCatList=[];
	$scope.findItemCatList=function () {
		itemCatService.findAll().success(
			function (response) {
                for (var i = 0; i <response.length ; i++) {
					$scope.itemCatList[response.id]=response[i].name;
                }
            }
		)
    }


 });
