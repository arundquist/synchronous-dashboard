function sendToPusher(event,data) {
  var pvals={
    appId: 'PUSHER APP ID GOES HERE',
    key: 'PUSHER KEY GOES HERE',
    secret: 'PUSHER SECRET GOES HERE',
    cluster: 'PUSHER CLUSTER GOES HERE',
    encrypted: true
  };
  
  var url = `https://api-${pvals["cluster"]}.pusher.com/apps/${pvals["appId"]}/events`;
  var body = {"name":event,"channels":["my-channel"],"data":JSON.stringify(data)};
  var bodystring = JSON.stringify(body);
  var now=new Date();
  var d = Math.round(now.getTime() / 1000);
  var auth_timestamp = d;
  var auth_version = '1.0';
  var bodymd5 = byteToString(Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, bodystring));
  var wholething = `POST
/apps/${pvals["appId"]}/events
auth_key=${pvals["key"]}&auth_timestamp=${auth_timestamp}&auth_version=${auth_version}&body_md5=${bodymd5}`;
  var wholethingencrypt = byteToString(Utilities.computeHmacSha256Signature(wholething,pvals["secret"]));
  Logger.log(wholethingencrypt);
  

  var options = {
    'method' : 'post',
    'contentType': 'application/json',
    // Convert the JavaScript object to a JSON string.
    'payload' : bodystring,
    'muteHttpExceptions' : true
  };
  var urltry = UrlFetchApp.fetch(url+`?auth_key=${pvals["key"]}&auth_timestamp=${auth_timestamp}&auth_version=${auth_version}&body_md5=${bodymd5}&auth_signature=${wholethingencrypt}`, options);

  
  }
  
function byteToString(byte) {
  var signature = byte.reduce(function(str,chr){
    chr = (chr < 0 ? chr + 256 : chr).toString(16);
    return str + (chr.length==1?'0':'') + chr;
  },'');
  return signature;
  }
