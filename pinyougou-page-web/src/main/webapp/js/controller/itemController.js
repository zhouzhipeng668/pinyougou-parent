app.controller('itemController',function($scope,$http){



	$scope.specificationItems={};
	
	//数量操作
	$scope.addNum=function(x){
		$scope.num=$scope.num+x;
		if($scope.num<1){
			$scope.num=1;
		}
	}	

	$scope.selectSpecification=function(key,value){
		$scope.specificationItems[key]=value;
		searchSku();
	}
	
	$scope.isSelected=function(key,value){
		if($scope.specificationItems[key]==value){
			return true;
		}else{
			return false;
		}
	}
	
	$scope.sku={};
	
	$scope.loadSku=function(){
		$scope.sku=skuList[0];
		$scope.specificationItems=JSON.parse(JSON.stringify($scope.sku.spec));
	}
	
	matchObject=function(map1,map2){
		for(var k in map1){
			if(map1[k]!=map2[k]){
				return false;
			}
		}
		for(var k in map2){
			if(map2[k]!=map1[k]){
				return false;
			}
		}
		return true;
	}
	
	
	searchSku=function(){
		
		for(var i=0;i<skuList.length;i++){
			if(matchObject($scope.specificationItems,skuList[i].spec)){
				$scope.sku = skuList[i];
				return;
			}
		}
		$scope.sku={id:0,title:'商品不存在',price:0};
	}
	
	
	
	$scope.addToCart=function(){
		//alert('skuID:'+$scope.sku.id);

		$http.get('http://localhost:9107/cart/addGoodsToCartList.do?itemId='
			+$scope.sku.id+'&num='+$scope.num,{'withCredentials':true}).success(
				function(response){
					if(response.success){
						location.href='http://localhost:9107/cart.html';
					}else{
						alert(response.message);
					}
				}
		);
	}

	
});