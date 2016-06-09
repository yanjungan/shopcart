window.onload=function(){
	if (!document.getElementsByClassName) {//由于较低版本的IE不识别这个。
		document.getElementsByClassName=function(cls){
			var ret=[];
			var eles=document.getElementsByTagName('*');
			for(var i=0,len=eles.length;i<len;i++){//indexOf()返回的是字母在字符串中的下标，>=0代表存在
				if (eles[i].className===cls /*===是严格等于*/
					||eles[i].className.indexOf(cls+'')>=0//当比较'aaa'和'aaa '时
					||eles[i].className.indexOf(''+cls+'')>=0///比较'aaa'和'bbb aaa ccc'时
					||eles[i].className.indexOf(''+cls)>=0///比较'aaa'和' aaa'时
					) {
					ret.push(eles[i]);
				}
			}
			return ret;
		}
	}
	var cartTable=document.getElementById('cartTable');
	var tr=cartTable.children[1].rows;
	var checkInputs=document.getElementsByClassName('check');/*在index.html文件中有全选和单选，但它们都有check这个className*/
	var checkAllInputs=document.getElementsByClassName('check_all');/*全选有check_all这个className*/
	var selectedTotal=document.getElementById('selectedTotal');
	var priceTotal=document.getElementById('priceTotal');
	var selected=document.getElementById('selected');//获取已选商品那个部分的Id
	var foot=document.getElementById('foot');
	var selectedViewList=document.getElementById('selectedViewList');
	var deleteAll=document.getElementById('deleteAll');

	//计算累加
	function getTotal(){
		var seleted=0;//件数累加
		var price=0;//价格累加
		var HTMLstr='';//用于字符串拼接
		for(var i=0,len=tr.length;i<len;i++){
			if (tr[i].getElementsByTagName('input')[0].checked) {//[0]表示的是全选，选择，的那个input
				tr[i].className='on';//如果那一行被选中，就变成高亮的
				seleted+=parseInt(tr[i].getElementsByTagName('input')[1].value);//将字符串转换成整数
				price+=parseFloat(tr[i].cells[4].innerHTML);//tr[i].cells[4]表示可以获取第5个td元素
				HTMLstr +='<div><img src="'+tr[i].getElementsByTagName('img')[0].src+'"/><span class="del" index="'+i+'">取消选择</span></div>';
				/*这是字符串的累加和拼接tr[i].getElementsByTagName('img')[0].src表示获取到那一行的img标签的src*/
			}else{
				tr[i].className='';//如果那一行未被选中，就不变高亮
			}
		}
		selectedTotal.innerHTML=seleted;
		priceTotal.innerHTML=price.toFixed(2);//绑定2个小数,把数字格式化为指定位数的小数
		selectedViewList.innerHTML=HTMLstr;
		if (seleted==0) {
			foot.className='foot';//如果没有商品被选中，就把浮层(预览层)隐藏起来
		}
	}
	//小计商品价格计算（每一行分别计算）
	function getSubTotal(tr){
		var tds=tr.cells;//获取一行的每一列
		var price=parseFloat(tds[2].innerHTML);//获取单价
		var count=parseInt(tr.getElementsByTagName('input')[1].value);//获取数量
		var subtotal=parseFloat(price*count);//计算小计的值
		tds[4].innerHTML=subtotal.toFixed(2);//格式化成2位小数
	}
	for(var i=0,len=checkInputs.length;i<len;i++){
		checkInputs[i].onclick=function(){
			if (this.className==='check_all check') {//全选框
				for(var j=0;j<checkInputs.length;j++){
					checkInputs[j].checked=this.checked;
				}
			}
			if (this.checked==false) {//如果有一个选框没有选择
				for(var k=0;k<checkAllInputs.length;k++){
					checkAllInputs[k].checked=this.checked;//全选框就不要去选，用false.
				}
			}
			getTotal();
		}
	}
	selected.onclick=function(){//对于已选商品
		if (foot.className=='foot') {
			if (selectedTotal.innerHTML!=0) {
				foot.className='foot show';//点击已选商品，会在className上加show,会有显示那个预览层
			}
		}else{
			foot.className='foot';
		}
	}
	selectedViewList.onclick=function(e){//事件代理，取消选择
		/*由于selectedViewList里面的所有子节点都是动态生成的，无法给里面的div添加事件
		这时候可以采取事件代理的方法，将事件代理到起父节点selectedViewList上*/
		/*if (e) {
			e=e;
		}else{
			e=window.event;//针对IE低版本浏览器
		}*/
		e=e||window.event;
		var el=e.srcElement;//srcElement是event这个事件对象里面的一个属性，可以存放span
		if (el.className=='del') {//说明是点击到了span上面了
			var index=el.getAttribute('index');//取自定义的属性要用getAttribute，这样的话，就知道第几行了
			var input=tr[index].getElementsByTagName('input')[0];//取到第一个input标签
			input.checked=false;//这样就取消选择了，那个选择框就被取消掉了
			input.onclick();

		}

	}

	//增减商品数量
	for(var i=0;i<tr.length;i++){
		tr[i].onclick=function(e){
			e=e||window.event;
			var el=e.srcElement;
			var cls=el.className;
			var input=this.getElementsByTagName('input')[1];//数量那个input框
			var val=parseInt(input.value);//获取此input的value值，以便做计算，进行数量加减
			var reduce_1=this.getElementsByTagName('span')[1];//获取减号那个位置的span
			switch(cls){
				case 'add':/*点击加号，就加1*/
				input.value=val+1;
				reduce.innerHTML='-';
				getSubTotal(this);//this==tr[i]
				break;
				case 'reduce':
				if (val>1) {
					input.value=val-1;
				}
				if (input.value<=1) {//如果用val<=1,则减到1的时候,还有一个-号,直到再减一次,-号消失
					reduce_1.innerHTML='';
				}
				getSubTotal(this);
				break;
				//每一行的删除
				case 'delete':
				var conf=confirm('确定要删除吗？');//这个函数界面上会跳出两个按钮，一个是确定，一个是取消，点击确定的时候，会返回true，点击取消时候，会返回false
				if(conf){
					this.parentNode.removeChild(this);//this指的是input,this.parentNode指的是input的父节点tbody,这样就可以实现自己把自己删掉了。
				}
				break;
				default:break;
			}
			getTotal();//进行增减数量后的合计
		}
		//自己在输入框里输入数量，也会进行计算。这时候会用到键盘事件onkeyup
		tr[i].getElementsByTagName('input')[1].onkeyup=function(){
			var val=parseInt(this.value);
			var tr=this.parentNode.parentNode;
			var reduce=tr.getElementsByTagName('span')[1];
			if (isNaN(val)||val<1) {//为空或者小于1的时候
				val=1;
			}
			this.value=val;//把val的值写入value中
			if (val<=1) {
				reduce.innerHTML='';
			}else{
				reduce.innerHTML='-';
			}
			getSubTotal(tr);
			getTotal();
			/*this指的是input,this.parentNode.parentNode==tr,input的父节点的父节点,
			但是不能直接用getSubTotal(tr).*/

		}

	}
	//多行删除
	deleteAll.onclick=function(){
		if (selectedTotal.innerHTML!='0') {//如果都没有选，就不要弹出弹框
			var conf=confirm('确定要删除吗？');
			if (conf) {
				for(var i=0;i<tr.length;i++){
					var input=tr[i].getElementsByTagName('input')[0];//获取每一行的第一个选择框
					//判断有没有被选中
					if (input.checked) {
						tr[i].parentNode.removeChild(tr[i]);
						i--;
						/*注意；一个数组每次被删除一个，数组里面的元素会前移一位，如果i不自减，就会有遗漏了，
						比如，要删除['a','b','c'],首先删除'a'，i=0,之后数组为['b','c']，如果要删除b,则i=1,这样
						就删除了'c'，而'b'并没有被删掉*/
					}
				}
			}
		}
			
	}
	//用户刚进入购物车界面的时候，是全选的状态；点击全选按钮之后，会去除全选
	checkAllInputs[0].checked=true;
	checkAllInputs[0].onclick();
}