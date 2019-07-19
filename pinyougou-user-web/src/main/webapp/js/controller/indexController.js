app.controller('indexController' ,function($scope,loginService){
    //读取当前登录人
    $scope.showName=function(){
        loginService.showName().success(
            function(response){
                $scope.loginName=response.loginName;
            }
        );
}
});
