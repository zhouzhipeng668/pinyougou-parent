app.controller('seckillGoodsController' ,function($scope,$location,seckillGoodsService,$interval){
    //读取列表数据绑定到表单中
    $scope.findList=function(){
        seckillGoodsService.findList().success(
            function(response){
                $scope.list=response;

            }
        );
    }

    $scope.findOne=function(){
        var id = $location.search()['id'];
        seckillGoodsService.findOne(id).success(
            function(response){
                $scope.entity=response;

                allSecond = Math.floor((new Date($scope.entity.endTime).getTime()-new Date().getTime())/1000);

                time = $interval(function(){
                    allSecond=allSecond-1;
                   $scope.timeString = convertTimeString(allSecond);
                    if(allSecond<=0){
                        $interval.cancel(time);
                    }
                },1000);
            }
        );
    }

    convertTimeString=function(allSecond){

        var days = Math.floor(allSecond/(60*60*24));
        var hours = Math.floor((allSecond-days*60*60*24)/(60*60));
        var minutes = Math.floor((allSecond-days*60*60*24-hours*60*60)/60);
        var seconds = allSecond-days*60*60*24-hours*60*60-minutes*60;
        var timeString = "";
        if(days>0){
            timeString=days+"天 ";
        }
        if(seconds<10){
            var seconds = "0"+seconds;
        }
        if(minutes<10){
            var minutes = "0"+minutes;
        }
        if(hours<10){
            var hours = "0"+hours;
        }

        return timeString+hours+":"+minutes+":"+seconds;
    }
    $scope.submitOrder=function(){
        seckillGoodsService.submitOrder($scope.entity.id).success(
            function(response){
                if(response.success){
                    alert("下单成功，请在1分钟内完成支付");
                    location.href="pay.html";
                }else{
                    alert(response.message);
                }
            }
        );
    }


});
