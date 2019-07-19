app.service('loginService',function($http){
    this.username=function () {
        return $http.get('../login/name.do');
    }
})