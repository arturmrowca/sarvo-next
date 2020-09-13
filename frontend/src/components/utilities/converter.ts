import sha256, { Hash, HMAC } from "fast-sha256";
import { TextEncoder, TextDecoder } from 'text-encoding';

export class Converter {

    private unhashMap: Map<string, string>;

    constructor()
    {
        this.unhashMap = new Map<string, string>();
    }

    public unhash(input:string)
    {
        return this.unhashMap[input]
    }

    public hash(input:string)
    {
        // First normalize the phone number
        var nowhite = input.replace(/\s/g, "");
        var pre = "+49" // future country dependent!!!
        if(nowhite[0] != "+")
        {
            nowhite = pre + nowhite.substr(1)
        }
        // then add crazy string to this
        var raw = nowhite

        nowhite = nowhite + "88idkadsarvoIsGeil"
        
        // Second hash it
        if (!("TextEncoder" in window)) 
        alert("Sorry, this browser does not support TextEncoder...");

        var enc = new TextEncoder(); // always utf-8 
        nowhite = nowhite + nowhite.substr(4, 9)
        var a = sha256(enc.encode(nowhite));

        var hash = Array.prototype.map.call(new Uint8Array(a.buffer), x => ('001231283' + x.toString(16)).slice(-2)).join('');
        
        this.unhashMap[hash] = raw;
        return hash;
    } 
}