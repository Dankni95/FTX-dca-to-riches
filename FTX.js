import FTXApiClient from "ftx-api-client";
import fetch from "node-fetch";

let ftx = null;

export class FTX {
	/**
	 * @param {boolean} testnet
	 * @param {string} key
	 * @param {string} secret
	 */
	constructor(key, secret) {
		this.key = key;
		this.secret = secret;


		if (!this.key) throw new Error("No FTX API Key found in .env");
		if (!this.secret) throw new Error("No FTX API Secret found in .env");


  ftx = new FTXApiClient({api_key: key, api_secret: secret});
	}

  async getAccount() {
   try { 
    var {data} = await ftx.call({resource: "/account", method: "GET"})
    }catch(e){
      console.log(e)
      return
    }
  return data
  }
  async getFearAndGreedIndex(){
    const data = fetch('https://api.alternative.me/fng/?format=json&date_format=uk')
    .then(res => res.json())
    return data
  }
  async getBalance(){
    try{
      var {data} = await ftx.call({resource: "/wallet/balances", method: "GET"})
    }catch(e){
      console.log(e)
      return
    }
    for(const coin of data.result){
     if (coin.free > 0) return coin
    }
  }
  async placeOrder(order){
    console.log(order)
    try{
      var res = await ftx.call({resource: "/orders", method: "POST", data: order})
      console.log(res)
      return res
    }catch(e){
      console.log(e)
    }
  }
}

