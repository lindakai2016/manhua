<?php
require_once("../../php/global.php");

/**
 *  成功返回:{ok:"ok",data:data}
 *  錯誤返回:{msg:msg_text}
 *  異常:其他
 */

//參數檢查
if(!isset($_REQUEST["vid"])){
    die_json(["msg"=>"缺少参数"]);
}
$vid=$_REQUEST["vid"];
$limit=20;
$offset=0;
if(isset($_REQUEST["limit"])){
    $limit=$_REQUEST["limit"];
}
if(isset($_REQUEST["offset"])){
    $offset=$_REQUEST["offset"];
}
//數據庫操作
$conn = new mysqli($mysql["host"], $mysql["user"], $mysql["password"], $mysql["database"]);
$conn->set_charset("utf8");
//查詢
$stmt=$conn->prepare("select * from video_comment where vid = ? order by suport-object desc,time desc limit ? offset ?");
$stmt->bind_param("iii",$vid,$limit,$offset);
$stmt->execute();
$result=$stmt->get_result();
$data=$result->fetch_all(MYSQLI_ASSOC);
$stmt->close();
for($i=0;$i<count($data);$i++){
    $stmt=$conn->prepare("select * from video_reply where vid=? and cid=? order by time asc");
    $stmt->bind_param("ii",$vid,$data[$i]["id"]);
    $stmt->execute();
    $result=$stmt->get_result();
    $data1=$result->fetch_all(MYSQLI_ASSOC);
    $data[$i]["reply"]=$data1;
    $stmt->close();
}
die_json(["ok"=>"ok","data"=>$data]);