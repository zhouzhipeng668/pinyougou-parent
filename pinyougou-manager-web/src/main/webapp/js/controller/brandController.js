app.controller('brandController' ,function($scope,$controller,brandService){

    $controller('baseController',{$scope:$scope});//继承

    //查询品牌列表
    $scope.findAll = function (){
        brandService.findAll().success(
            function (response) {
                $scope.list = response;
            }
        );
    }

    //分页
    $scope.findPage=function(page,size){
        brandService.findPage(page,size).success(
            function(response){
                $scope.list=response.rows;
                $scope.paginationConf.totalItems=response.total;//更新总记录数
            }
        );
    }
    //增加
    $scope.save=function(){
        var object = null;
        if($scope.entity.id!=null){//如果有ID
            object=brandService.update($scope.entity);
        }else {
            object=brandService.add($scope.entity);
        }
        object.success(
            function(response){
                if(response.success){
                    //重新查询
                    $scope.reloadList();//重新加载
                }else{
                    alert(response.message);
                }
            }
        );
    }

    //查询一个
    $scope.findOne=function (id) {
        brandService.findOne(id).success(
            function (response) {
                $scope.entity=response;
            }
        )
    }
    //删除


    //批量删除
    $scope.dele=function(){
        //获取选中的复选框
        brandService.dele($scope.selectIds).success(
            function(response){
                if(response.success){
                    $scope.reloadList();//刷新列表
                }
            }
        );
    }
    //条件查询
    $scope.searchEntity={};
    $scope.search=function (page,size) {
        brandService.search(page,size,$scope.searchEntity).success(
            function(response){
                $scope.list=response.rows;
                $scope.paginationConf.totalItems=response.total;//更新总记录数
            }
        );
    }
});