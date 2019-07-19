app.controller('indexController' ,function($scope,loginService){
    //读取当前登录人
    $scope.showUserName=function(){
        loginService.username().success(
            function(response){
                $scope.username=response.username;
            }
        );
}
});
