<?php
require_once('mysql_connect.php');////connect to database
$output = ['success'=> false];
if(!$conn){
    //throw an error if connection fails
    $output['message'] = "Fatal Error: could not reach database";
    $fatal_error = json_encode($output);
    print_r($fatal_error);
    exit();
}

if(isset($_POST['student_id'])){
    $table_id= $_POST['entry_id'];
} else {
    $output['message'] = "Error: Entry could not be deleted, unable to locate entry in database";
    $fatal_error = json_encode($output);
    print_r($fatal_error);
    exit();
}
$delete_query = "DELETE * FROM `grades` WHERE `id`='$table_id'";

$json_output = json_encode($output);
print_r($json_output);
mysqli_close($conn); ////closing database connection
?>