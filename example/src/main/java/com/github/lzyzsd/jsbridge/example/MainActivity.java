package com.github.lzyzsd.jsbridge.example;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.View.OnClickListener;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.widget.Button;
import android.widget.Toast;

import com.github.lzyzsd.jsbridge.BridgeHandler;
import com.github.lzyzsd.jsbridge.BridgeWebView;
import com.github.lzyzsd.jsbridge.CallBackFunction;
import com.github.lzyzsd.jsbridge.CustomWebViewClient;
import com.github.lzyzsd.jsbridge.DefaultHandler;
import com.github.lzyzsd.jsbridge.JavaCallHandler;
import com.github.lzyzsd.jsbridge.JsHandler;
import com.github.lzyzsd.jsbridge.JsWebView;
import com.google.gson.Gson;


import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class MainActivity extends Activity implements OnClickListener {

	private final String TAG = "MainActivity";

	JsWebView webView;

	Button button;

	int RESULT_CODE = 0;

	ValueCallback<Uri> mUploadMessage;

    static class Location {
        String address;
    }

    static class User {
        String name;
        Location location;
        String testStr;
    }

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_main);

        webView = (JsWebView) findViewById(R.id.webView);

		button = (Button) findViewById(R.id.button);

		button.setOnClickListener(this);

		webView.setDefaultHandler(new DefaultHandler());
		webView.setWebViewClient(new CustomWebViewClient(webView.getWebView()) {


			@Override
			public String onPageError(String url) {
				//指定网络加载失败时的错误页面
				return "file:///android_asset/error.html";
			}

			@Override
			public Map<String, String> onPageHeaders(String url) {

				// 可以加入header

				return null;
			}

			@SuppressWarnings("unused")
			public void openFileChooser(ValueCallback<Uri> uploadMsg, String AcceptType, String capture) {
				this.openFileChooser(uploadMsg);
			}

			@SuppressWarnings("unused")
			public void openFileChooser(ValueCallback<Uri> uploadMsg, String AcceptType) {
				this.openFileChooser(uploadMsg);
			}

			public void openFileChooser(ValueCallback<Uri> uploadMsg) {
				mUploadMessage = uploadMsg;
				pickFile();
			}
		});


		/*webView.loadUrl("file:///android_asset/test/index_cn.html");*/
		webView.loadUrl("file:///android_asset/1111/index_cn.html");
	/*	webView.loadUrl("http:www.hao123.com");*/

		/*webView.registerHandler("submitFromWeb", new JsHandler() {

			@Override
			public void OnHandler(String handlerName, String responseData, CallBackFunction function) {
				Log.e(TAG, "handler = submitFromWeb, data from web = " + responseData);
				function.onCallBack("submitFromWeb exe, response data 中文 from Java");
			}
		});*/
		ArrayList<String> list=new ArrayList<>();
		list.add("submitFromWeb");
		List<String> tags=new ArrayList<>();
		tags.add("ExhibitionDetail/");
		tags.add("ExhibitionDetailssss/");
		webView.registerHandlers(tags,list, new JsHandler() {
			@Override
			public void OnHandler(String tag,String responseData, CallBackFunction function) {
				Log.e("backinfo","tag:"+tag+",responseData:"+responseData);
                function.onCallBack(responseData);
			}
		});
		webView.registerHandler("", new BridgeHandler() {
			@Override
			public void handler(String data, CallBackFunction function) {

			}
		});


        User user = new User();
        Location location = new Location();
        location.address = "SDU";
        user.location = location;
        user.name = "大头鬼";


        webView.send("hello");

	}

	public void pickFile() {
		Intent chooserIntent = new Intent(Intent.ACTION_GET_CONTENT);
		chooserIntent.setType("image/*");
		startActivityForResult(chooserIntent, RESULT_CODE);
	}

	public void event(String messageEvent) {
        Log.e("backinfo","跑到这里了");
	}
	@Override
	protected void onActivityResult(int requestCode, int resultCode, Intent intent) {
		if (requestCode == RESULT_CODE) {
			if (null == mUploadMessage){
				return;
			}
			Uri result = intent == null || resultCode != RESULT_OK ? null : intent.getData();
			mUploadMessage.onReceiveValue(result);
			mUploadMessage = null;
		}
	}


	@Override
	public void onClick(View v) {
		if (button.equals(v)) {

		}

	}

}
