const client = require('cheerio-httpcli');
const request = require('request');
const urlType= require('url');
const fs = require('fs').promises;
const fs1 = require('fs');
const { each } = require('async');
const { get } = require('request');
const { getHashes } = require('crypto');




//메인 url, 파일 저장 경로
var main_url = "https://buondua.com";
var savedir = "G:\\";
var param = {};

//다음 페이지 전환 https://buondua.com/?start=20
var main_pageCount = 1000;
var main_pageUrl = main_url+"?start="+main_pageCount;

    //파일이 없을 때 파일이름을 사용해서 생성할거임
var main_page_list = [];

var $main_page_data;
var fileName = [];


//리스트 카운트 
var list_Count = 0;
var list_url = "?page="
var list= [];
var img_url = [];
var img_fname=[];
var ListUrl= encodeURI(main_url+" ");

var testTxt =savedir+ " ";

//URL 회피
const httpsurl_img2 ="data-src=\"https://images2";


//정규표현식
var img_reg=/data-src="https:\/\/[imgaes2]+/g; // 이미지 URl 추출 부분














/*
    클라이언트 헤더 변경 유저로 속이고 접속
*/
client.set('headers',{
    'user-agent' : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.93 Safari/537.36',
    'Accept-Charset' : 'utf-8'
});


//파일 다운로드 함수
//파일 생성 여부 확인 하고 생성 또는 넘어감 
async function createDir(DirNamePath){
    
    await fs.readdir(DirNamePath)
     .then(()=>{
          Promise.reject('폴더 있음');
     })
     .catch((err)=>{
         if(err.code === 'ENOENT'){
             console.log('폴더 없음');
             new Promise(function(){ fs.mkdir(DirNamePath);}) 
         }
          Promise.reject(err);
     })
 }

 //파일 다운로드 
function file_download(fileName,filePath,imgUrl){
    var File_Path = filePath + fileName+".jpg";
    request(imgUrl).pipe(fs1.createWriteStream(File_Path));
}
 



// 비동기 처리 -> 동기 처리로 변경 
//async await promise
function mainpagefunc(mainpageUrl)
{
    return new Promise(function(resolve,reject){
        client.fetch(mainpageUrl,param,function(err,$,res)  {

            if(err) { console.log("Error:",err); return}
            
            $(".item-thumb").each(function(idx){
                var item = $(this).html();
                
                 //alt 추출 > 파일 제목으로 쓸꺼임
                item.match(/alt="[/一-龥/가-힇ㄱ-ㅎㅏ-ㅣ/a-zA-Z/0-9/]*[/@/\s/\S]*[)]+/g).forEach((idx) =>{
                    fileName.push((idx.replace("alt=\"","")).replace(":",""));
                });
                 
                //Url 추출
                item.match(/href="\/[/一-龥/가-힇ㄱ-ㅎㅏ-ㅣ/a-zA-Z/0-9/-|-–-]+[/一-龥/가-힇ㄱ-ㅎㅏ-ㅣ/a-zA-Z/0-9/]+/g)
                .forEach((idx) =>{
                    main_page_list.push(idx.replace("href=\"",""));
                })
            })

            resolve();
        })
    })
}

//메인페이지 URL page=? 사용하는 함수
function imgpageurl(FileName,urlPath)
{
    return new Promise(function(resolve,reject){

        client.fetch(urlPath,param,function(err,$,res) {

            if(err) { console.log("Error:",err); return}

            //다음 node로 넘어가면 리스트를 초기화 해야함
            if(!list.length)
            {
                $(".pagination").each(function(idx){
                    var item = $(this).html();
            
                    //리스트 추출 부분 / 2를 해줘야함 
                    item.match(/href="\/[/一-龥/가-힇ㄱ-ㅎㅏ-ㅣ/a-zA-Z/0-9/-|-–-]+[/一-龥/가-힇ㄱ-ㅎㅏ-ㅣ/a-zA-Z/0-9/]+/g)
                    .forEach((idx) =>{
                        list.push(idx.replace("href=\"",""));
                    })
                    
                })
                
            }
            //이미지 URl 추출 부분
            $(".article-fulltext").each(function(idx){

                var item = $(this).html();
                ///data-src="https:\/\/[/a-zA-Z/0-9/-]+[/a-zA-Z/0-9/-/./?/=/&/;/_/%/-]+/g
                if(item.search(img_reg) != -1)
                {
                    console.log(item.search(img_reg));
                    return ;
                }
                else{
                    item.match(/data-src="https:\/\/cdn[/一-龥/가-힇ㄱ-ㅎㅏ-ㅣ/a-zA-Z/0-9/_/./-]+/g)
                    .forEach((idx)=>{
                        img_url.push(idx.replace("data-src=\"",""));
                    });
    
                    item.match(/alt="[/一-龥/가-힇ㄱ-ㅎㅏ-ㅣ/a-zA-Z/0-9/_/./-/\s/:/(/)-]+/g)
                    .forEach((idx)=>{
                        
                        img_fname.push((idx.replace("alt=\"","")).replace(":",""));
                       
                    });
                }
            })
            resolve();
        })
    })
    
    
}



// TEST 함수
async function func(){

    await mainpagefunc(main_pageUrl);
    /*
        mainpagefunc함수 리턴 값 
        fileName : 디렉토리 파일 이름으로 사용할 변수를 저장 
        main_page_list : 페이지의 이미지 리스트 
    */
   
    var i=0;
    var SUrlPath = encodeURI(main_url+main_page_list[i]+list_url+list_Count);

    await imgpageurl(fileName[i],SUrlPath);

    /*
        imgpageurl 함수 리턴 값 
        list : 이미지 파일이 다음 페이지까지 있으면 그 페이지로 넘어가기 위한 변수
        img_url : 이미지 URL
        img_fname : 파일 이름으로 사용 
    */

    console.log(list);
    console.log(img_url);
    console.log(img_fname);
    
        
        /*
        while(true)//main_page_list
        {
            do{//이미지 추출 후 저장 
                
                var SUrlPath = encodeURI(main_url+main_page_list[i]+list_url+list_Count);
                var j=0;//url
            
                await imgpageurl(fileName[i],SUrlPath);
    
                await createDir(savedir+fileName[i]);
                while(j < img_url.length)//img_url
                {
                     file_download(img_fname[j],savedir+fileName[i]+"/",img_url[j]);
                    j++;
                }
            
            
              list_Count++
            } while(list_Count<=((list.length)/2))
            list = [];
        }
        */
}

func();
//TEST 함수



//실행 
async function start()
{
    while(true)//파일 종료 코드  main_pageCount
    {
        main_pageUrl= main_url+"?start="+main_pageCount;
        await mainpagefunc(main_pageUrl);
        var i=0;
        while(true)//main_page_list
        {
            do{
                
                var SUrlPath = encodeURI(main_url+main_page_list[i]+list_url+list_Count);
                var j=0;//url
            
                await imgpageurl(fileName[i],SUrlPath);
    
                await createDir(savedir+fileName[i]);
                while(j < img_url.length)//img_url
                {
                     file_download(img_fname[j],savedir+fileName[i]+"/",img_url[j]);
                    j++;
                }
            
            
              list_Count++
            } while(list_Count<=((list.length)/2))
            list = [];
        }
    }
}


//imgpageurl(fileName[0],main_url+main_page_list[0]);
    /*

         //alt 추출 > 파일 제목으로 쓸꺼임
        item.match(/alt="\/[/一-龥/가-힇ㄱ-ㅎㅏ-ㅣ/a-zA-Z/0-9/-|-–-]+[/一-龥/가-힇ㄱ-ㅎㅏ-ㅣ/a-zA-Z/0-9/]+/g)
        .forEach((idx) =>{
            fileName.push(idx.replace("alt=\"",""));
        });

        //Url 추출
        item.match(/href="\/[/一-龥/가-힇ㄱ-ㅎㅏ-ㅣ/a-zA-Z/0-9/-|-–-]+[/一-龥/가-힇ㄱ-ㅎㅏ-ㅣ/a-zA-Z/0-9/]+/g)
        .forEach((idx) =>{
            main_page_list.push(idx.replace("href=\"",""));
        });
    */
    




