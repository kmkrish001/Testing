/// <reference path="../../common/jquery.d.ts" />
/// <reference path="../../ej.web.all.d.ts" />

class clipboardCleaner {
    private callback:any;
    private env:object;
    constructor(currentDocument: Document,callback:any,env:object) {        
        var temp = this;
        this.callback=callback;
        this.env=env;
        this.currentDocument = currentDocument;
        if (this._isIE()) {
            //this.currentDocument.body.addEventListener("keydown", keyEventRouter);
            if (this.currentDocument.body.addEventListener) {
                this.currentDocument.body.addEventListener("keydown", keyEventRouter);
            }
            else
                (<any>this.currentDocument.body).attachEvent("onkeydown", keyEventRouter);

        }
        if (this.currentDocument.body.addEventListener)
            this.currentDocument.body.addEventListener("paste", pasteRouter);
        else
            (<any>this.currentDocument.body).attachEvent("onpaste", pasteRouter);
        function pasteRouter(args: ClipboardEvent) {
            if(!(<any>env).model.enabled) return false
            if(temp.CleanerState){
                temp._pasteHandler(args);
                if (temp.syncLoad) {
                    args.preventDefault();
                    args.stopPropagation();
                    return false;
                }
            }            
        }
        function keyEventRouter(args: KeyboardEvent) {
            if(temp.CleanerState)
                temp._keydownHandler(args);
        }
    }
    public CleanerState:boolean=true;
    public clipboardData: ClipboardData;
    private syncLoad: boolean = false;
    private _keydownHandler(e: KeyboardEvent,state:boolean=false) {
        if ((this._isIE() && e.ctrlKey && !e.shiftKey && e.keyCode == 86 && this.flagState)||state) {
            this.flagState = false;
            this._setContent();
        }
    }
    private _setContent() {
        var temp = this;
        this.content = this.currentDocument.createElement("div");
        var tempText,tempBlock=this.currentDocument.createElement("P");
        this.content.id = "ClipboardData";
        this.content.style.position = "absolute";
        this.content.style.height = "10px";
        this.content.style.width = "10px";
        this.content.style.overflow = "hidden";
        this.content.style.top = "-3000px";
        tempText = this.currentDocument.createTextNode("PastedContent");
        if (ej.browserInfo().name == "chrome"){
            tempBlock.appendChild(tempText);
            this.content.appendChild(tempBlock);
        }
        else
            this.content.appendChild(tempText);
        if (window.getSelection) {
            var selection = this.currentDocument.getSelection();
            if (selection.rangeCount > 0) {
                var range = selection.getRangeAt(0);
                range.deleteContents();
                range.collapse(true);
                range.insertNode(this.content);
                this._updateRange(tempText, 0,tempText.textContent.length);
                this.content.focus();
                this.syncLoad = false;
            }
        }
    }
    private _insertContent(args=true):void{
        let tempSpanNode = this.currentDocument.createElement("span"),
        elemColl:Array<HTMLElement>=[],
        content:Node,blockElem:HTMLElement=this.currentDocument.createElement("p")
        tempSpanNode.appendChild(content=this.currentDocument.createTextNode(String.fromCharCode(65279)));
        blockElem.appendChild(tempSpanNode);
        this._finalCleanup(this.Container);
        this.Container.appendChild(blockElem);        
        if(this._isIE()&&args){
            elemColl=[];
            for (var gt = this.Container.childNodes.length-1; gt>-1 ; gt--)
                elemColl.push(<HTMLElement>this.Container.childNodes.item(gt));
            for (var gt = 0; gt < elemColl.length; gt++)
                this._insertAfter(<HTMLElement>this.content,elemColl[gt]);
            (<any>this.content).removeNode(true);
        }
        else
            this._contentPositionHandler();       
        $((ej.browserInfo().name=="msie"||ej.browserInfo().name=="mozilla")?this.currentDocument.body.parentNode:this.currentDocument.body).scrollTop($(tempSpanNode).offset().top - 25);
        this.callback.call(this.env);
        this._updateRange(content,0,content.textContent.length);   
    }
    private _insertAfter(elem:HTMLElement,newElem):void{
        if(elem.nextSibling){
            elem.parentElement.insertBefore(newElem,elem.nextSibling)
        }
        else
        {
            elem.parentElement.appendChild(newElem)
        }
    }
    private listContents:Array<string>=[];
    private _findValidListType(elem:Node):void{
        if(elem.nodeType==3 && elem.textContent.trim().length>0){
            this.listContents.push(elem.textContent);
        }
        if(elem=elem.firstChild){
             do {
                this._findValidListType(elem);
            }
            while (elem = elem.nextSibling)
        }
    }
    private blockNode = ["div", "p", "h1", "h2", "h3", "h4", "h5", "h6", "address", "blockquote", "button", "center", "dd", "dir", "dl", "dt", "fieldset", "frameset", "hr", "iframe", "isindex", "li", "map", "menu", "noframes", "noscript", "object", "ol", "pre", "table", "tbody", "td", "tfoot", "th", "thead", "tr", "ul", "header", "article", "nav", "footer", "section", "aside", "main", "figure", "figcaption"];
    private _createNodeCollection(parentNodes:Array<string>):GeneratedNodes{
        let leafnode,temp:HTMLElement=this.currentDocument.createElement(parentNodes.shift()),tagName:string;
        leafnode=temp;
        while(tagName=parentNodes.shift()){
            temp=this.currentDocument.createElement(tagName).appendChild(temp)
        }
        return {leaf:leafnode,root:temp};
    }
    private _contentPositionHandler(){
        var selection = this.currentDocument.getSelection(),
        elem:HTMLElement, tempElem:HTMLElement,
        parentNodes:Array<string>=[],childNodes:Array<HTMLElement>=[],
        nodeSet:GeneratedNodes;
        
        if (selection.rangeCount > 0) {
            if(this.content){
                let range = this.currentDocument.createRange(),Selection = this.currentDocument.getSelection();
                range.selectNode(this.content);
                Selection.removeAllRanges();
                Selection.addRange(range);                
            }
            var range = selection.getRangeAt(0);
            if(range.startContainer==range.endContainer){
                if(range.startOffset!=range.endOffset)
                    range.deleteContents();                     
                range.insertNode(this.Container);
                elem=<HTMLElement>this.Container.parentNode;
                if(elem.nodeName.toLowerCase()!="body"){
                    do
                    parentNodes.push(elem.nodeName.toLowerCase());
                    while(this.blockNode.indexOf(elem.nodeName.toLowerCase())==-1&& (elem=elem.parentElement))
                    nodeSet=this._createNodeCollection(parentNodes);
                    if(elem)
                        if(elem.nextSibling)
                            elem.parentElement.insertBefore(nodeSet.root,elem.nextSibling);
                        else
                            elem.parentElement.appendChild(nodeSet.root);
                    elem=<HTMLElement>this.Container;
                    while(elem=<HTMLElement>elem.nextSibling)
                        nodeSet.leaf.appendChild(elem);
                    this._insertAfter(this.Container.parentElement,this.Container);
                }                
                for(let index=0;index<this.Container.childNodes.length;index++)
                    childNodes.push(<HTMLElement>this.Container.childNodes[index]);
                while(tempElem=childNodes.shift())
                    this.Container.parentElement.insertBefore(tempElem,this.Container);
            }
            else{
                range.deleteContents();
                range.insertNode(this.Container);
                for(let index=0;index<this.Container.childNodes.length;index++)
                {
                    childNodes.push(<HTMLElement>this.Container.childNodes[index]);
                }
                while(tempElem=childNodes.shift())
                    this.Container.parentElement.insertBefore(tempElem,this.Container);
            }
        }
        this._remove(this.Container);
        this._remove(this.content);
        this.content=null;        
    }
    private flagState: boolean = true;
    private content: HTMLElement = null;
    private _updateRange(node, sOffset, eOffset) {
        var range = this.currentDocument.createRange(), Selection = this.currentDocument.getSelection();
        range.setStart(node, sOffset);
        range.setEnd(node, eOffset);
        Selection.removeAllRanges();
        Selection.addRange(range);
    }
    private htmlContent: string = "";
    private currentDocument: Document;
    private _pasteHandler(args: ClipboardEvent): void {
        this.clipboardData = { plain: null, rtf: null, html: null };
        this.syncLoad=false;
        if (this._isIE())
            this._extractClipboardIE(args);
        else {
            this._fillClipboard(args);
            this._extractClipboardNonIE(args);
        }

    }
    private _isIE(): boolean {
        return navigator.userAgent.match(/Trident|msie/i) != null;
    }
    private _extractClipboardNonIE(args: ClipboardEvent) {
        if (this.clipboardData.html) {
            this.content =null;
            this.htmlContent = this.clipboardData.html;            
            this._processContent(args);
        }
        else if (ej.browserInfo().name == "chrome" && this.clipboardData.plain){
            var temp = this.currentDocument.createElement("div"),content,tempcontents=this.clipboardData.plain.split("\n");
            var temp2 = this.currentDocument.createElement("p");
            if(tempcontents.length){
                while(content = tempcontents.shift()){                            
                    temp2.appendChild(this.currentDocument.createTextNode(content));
                    tempcontents.length && temp2.appendChild(this.currentDocument.createElement("br"))
                }
            }
            else{                
                temp2.appendChild(this.currentDocument.createTextNode(this.clipboardData.plain));                
            }
            this.htmlContent=temp2.innerHTML;
            this._processContent(args,false);
        }
        else if(args && args.clipboardData && args.clipboardData.items.length){
            this.callback.call(this.env,args);
        }
        else {
            this._setContent();
            this._contentUpdater();
        }
    }
    private _extractClipboardIE(args: ClipboardEvent) {
        this._contentUpdater();
    }
    private _contentUpdater() {
        var temp = this;
        setTimeout(function () {
            if (temp.content)
                temp.clipboardData.html = temp.htmlContent = temp.content.innerHTML;
            !temp.flagState && (temp.flagState = true);
            temp._processContent();
        }, 0);
    }
    private _fillClipboard(args: ClipboardEvent) {
        this.clipboardData.html = args.clipboardData.getData("text/html") ? args.clipboardData.getData("text/html") : null;
        this.clipboardData.plain = args.clipboardData.getData("text/plain") ? args.clipboardData.getData("text/plain") : null;
        this.clipboardData.rtf = args.clipboardData.getData("text/rtf") ? args.clipboardData.getData("text/rtf") : null;
      
    }
    private insertCleanedContent:boolean=true;
    private _processContent(args:ClipboardEvent=null,state=true): void {
        var elm: HTMLElement = this.currentDocument.createElement("p"),temp=this,nonBlock:boolean=true;
        let patern:RegExp= /class="?Mso|style="[^ ]*\bmso-/i,
            tempContainer:HTMLElement=this.currentDocument.createElement("p"),
            ChildNode:Node;
        if(patern.test(this.htmlContent)&& state ){
            this.htmlContent= this.htmlContent.replace(/<img[^>]+>/i,"");
            elm.innerHTML=this.htmlContent;
            //this.remove(this.content);
            this.syncLoad = true;
            this.Collection = [];
            this.blockqouteNodes = [];
            this.listNodes = [];
            this._cleanup(elm);
            this._flush();
            if (this.filterOptions.listConversion) {
                this._listConverter();
            }
            if (this.filterOptions.cleanElements) {
                this._blockquoteConvert();
                this._cleanElement(elm);
                this._flush();
            }
            if (this.filterOptions.cleanCSS) {
                this._cleanStyles(elm);
                this._flush(false);
            }
            this.Container = elm;
            if(this.insertCleanedContent)
				this._insertContent();
        }
        else {
            this.syncLoad = true;
            elm.innerHTML=this.htmlContent;
            if (this.filterOptions.cleanCSS) {
                this._cleanStyles(elm);
                this._flush(false);
            }
            if(elm.childNodes.length){
                for (let index=0;index<elm.childNodes.length;index++){
                    if(this.blockNode.indexOf(elm.childNodes[index].nodeName.toLowerCase())!=-1)
                        nonBlock=false;
                }
                if(nonBlock){
                    tempContainer.appendChild(elm);
                    elm = tempContainer;
                }
            }
            this.Container = elm;
			if(this.insertCleanedContent)
				this._insertContent(!nonBlock);
        }
    }
    private _flush(check: boolean = true): void {
        let temp: HTMLElement,tempColl:Array<HTMLElement>=[];
        if (check) {
            while (temp = <HTMLElement>this.tempCleaner.shift())
                this._remove(temp);
        }
        else
            while (temp = <HTMLElement>this.tempCleaner.shift()) {
                if (temp.childNodes.length) {
                    tempColl=[];
                    for (let index = 0; index < temp.childNodes.length; index++) {
                        tempColl.push(<HTMLElement>temp.childNodes[index]);
                    }
                    for (let index = 0; index < tempColl.length; index++) {
                        temp.parentElement.insertBefore(tempColl[index], temp);
                    }
                    
                }
                this._remove(temp);
            }

    }
    public filterOptions: FilterModel = {
        listConversion: true, cleanCSS: true,
        removeStyles: false,
        cleanElements: true
    }
    private Container: HTMLElement;
    private Collection: Array<NodeDatas> = [];
    private _makeConvertion(): HTMLElement {
        var root = this.currentDocument.createElement("div"), temp: HTMLElement, pLevel: number = 1, prevList: HTMLElement, listCount: number = 0, elem: HTMLElement;
        for (let index = 0; index < this.Collection.length; index++) {
            if ((this.Collection[index].level == 1) && listCount == 0) {
                if (this.Collection[index].content) {
                    root.appendChild(temp = this.currentDocument.createElement(this.Collection[index].type));
                    prevList = this.currentDocument.createElement("li");
                    prevList.appendChild(this.currentDocument.createTextNode(this.Collection[index].content.textContent));
                    temp.appendChild(prevList);
                    temp.setAttribute("level", this.Collection[index].level.toString());
                    temp.style.listStyle = this._getlistStyle(this.Collection[index].type, this.Collection[index].level);
                }
            }
            else if (this.Collection[index].level == pLevel) {
                if (prevList.parentElement.tagName.toLowerCase() == this.Collection[index].type){
                    prevList.parentElement.appendChild(prevList = this.currentDocument.createElement("li"));
                    prevList.appendChild(this.currentDocument.createTextNode(this.Collection[index].content.textContent));
                }                    
                else {
                    temp = this.currentDocument.createElement(this.Collection[index].type);
                    this._insertAfter(prevList.parentElement,temp);
                    prevList = this.currentDocument.createElement("li")
                    prevList.appendChild(this.currentDocument.createTextNode(this.Collection[index].content.textContent));
                    temp.appendChild(prevList);
                    temp.setAttribute("level", this.Collection[index].level.toString());
                }
            }
            else if (this.Collection[index].level > pLevel) {
                prevList.appendChild(temp = this.currentDocument.createElement(this.Collection[index].type));
                prevList = this.currentDocument.createElement("li")
                prevList.appendChild(this.currentDocument.createTextNode(this.Collection[index].content.textContent));
                temp.appendChild(prevList);
                prevList.style.marginLeft = (this.Collection[index].level - pLevel - 1) * 40 + "px";
                temp.setAttribute("level", this.Collection[index].level.toString());
                temp.style.listStyle = this._getlistStyle(this.Collection[index].type, this.Collection[index].level);
            }
            else if (this.Collection[index].level == 1) {
                if((<HTMLElement>root.lastChild).tagName.toLowerCase()==this.Collection[index].type)
                    temp=<HTMLElement>root.lastChild;
                else
                    root.appendChild(temp = this.currentDocument.createElement(this.Collection[index].type));
                prevList = this.currentDocument.createElement("li");
                prevList.appendChild(this.currentDocument.createTextNode(this.Collection[index].content.textContent));
                temp.appendChild(prevList);
                temp.setAttribute("level", this.Collection[index].level.toString());
                temp.style.listStyle = this._getlistStyle(this.Collection[index].type, this.Collection[index].level);
            }
            else {
                elem = prevList;
                while (elem = elem.parentElement) {
                    if (elem.attributes.getNamedItem("level")) {
                        if (parseInt(elem.attributes.getNamedItem("level").textContent) == this.Collection[index].level) {
                            if (elem.tagName.toLowerCase() == this.Collection[index].type) {
                                prevList = this.currentDocument.createElement("li")
                                prevList.appendChild(this.currentDocument.createTextNode(this.Collection[index].content.textContent));
                                elem.appendChild(prevList);
                            }
                            else {
                                temp = this.currentDocument.createElement(this.Collection[index].type);
                                this._insertAfter(prevList.parentElement,temp);
                                prevList = this.currentDocument.createElement("li");
                                prevList.appendChild(this.currentDocument.createTextNode(this.Collection[index].content.textContent));
                                temp.appendChild(prevList);
                                temp.setAttribute("level", this.Collection[index].level.toString());
                                temp.style.listStyle = this._getlistStyle(this.Collection[index].type, this.Collection[index].level);
                            }
                            break;
                        }
                        else if (this.Collection[index].level > parseInt(elem.attributes.getNamedItem("level").textContent)) {
                            elem.appendChild(temp = this.currentDocument.createElement(this.Collection[index].type));
                            prevList = this.currentDocument.createElement("li");
                            prevList.appendChild(this.currentDocument.createTextNode(this.Collection[index].content.textContent));
                            temp.appendChild(prevList);
                            prevList.style.marginLeft = (this.Collection[index].level - parseInt(elem.attributes.getNamedItem("level").textContent) - 1) * 40 + "px";
                            temp.setAttribute("level", this.Collection[index].level.toString());
                            temp.style.listStyle = this._getlistStyle(this.Collection[index].type, this.Collection[index].level);
                            break;
                        }
                    }

                    continue;
                }
            }
            pLevel = this.Collection[index].level;
            listCount++;
        }
        return root;
    }
    private _listConverter(): void {
        var content: string, level: number, type: string, stNode: Node, tempNode: Node;
        let data: Array<nodeformat> = [],elemColl:Array<HTMLElement>=[];
        for (let index = 0; index < this.listNodes.length; index++) {

            if (this.listNodes[index] == null) {
                data.push({ content: this._makeConvertion(), node: this.listNodes[index - 1] });
                this.Collection = [];
                continue;
            }
            if(this.listNodes[index].attributes.getNamedItem("style")) {
            content = this.listNodes[index].attributes.getNamedItem("style").textContent;
            if (content && content.indexOf("level") != -1)
                level = parseInt(content.charAt(content.indexOf("level") + 5));
            else
                level = 1;
            this.listContents=[];
            this._findValidListType(this.listNodes[index])
            if (this.listContents[0].length > 1)
                type = "ol";
            else
                type = "ul";

            tempNode =this.listContents[1] ?
                this.currentDocument.createTextNode(this.listContents[1]):
                this.currentDocument.createTextNode("");
            this.Collection.push({
                type: type,
                //content: (this.listNodes[index].children[1] && this.listNodes[index].children[1].firstChild) ?this.listNodes[index].children[1].firstChild:this.currentDocument.createTextNode(""),
                content: tempNode,
                level: level
            });
        }

        }
        while ((stNode = this.listNodes.shift()) ? stNode : (stNode = this.listNodes.shift())) {
            elemColl=[];
            for (var temp1: number = 0; temp1 < data.length; temp1++) {
                if (data[temp1].node == stNode) {
                    for (let index = 0; index < data[temp1].content.childNodes.length; index++) {
                        elemColl.push(<HTMLElement>data[temp1].content.childNodes[index]);                        
                    }
                    for (let index = 0; index<elemColl.length ; index++) {
                        stNode.parentElement.insertBefore(elemColl[index], stNode);
                    }                    
                    break;
                }
            }
            (<HTMLElement>stNode).remove && (<HTMLElement>stNode).remove();
            (<any>stNode).removeNode && (<any>stNode).removeNode(true);
        }
    }
    private _blockquoteConvert(): void {
        var temp: HTMLElement,elemColl:Array<HTMLElement>=[];
        for (var index = 0; index < this.blockqouteNodes.length; index++) {
            temp = this.currentDocument.createElement("blockquote");elemColl=[];            
            if (this.blockqouteNodes[index].childNodes && this.blockqouteNodes[index].childNodes.length){
                for (var gt = 0; gt < this.blockqouteNodes[index].childNodes.length; gt++)
                    elemColl.push(<HTMLElement>this.blockqouteNodes[index].childNodes.item(gt));
                for (var gt = 0; gt < elemColl.length; gt++)
                    temp.appendChild(elemColl[gt]);          
                
            }
            (<HTMLElement>this.blockqouteNodes[index]).parentElement.insertBefore(temp, this.blockqouteNodes[index]);
            (<HTMLElement>this.blockqouteNodes[index]).remove && (<HTMLElement>this.blockqouteNodes[index]).remove();
            (<any>this.blockqouteNodes[index]).removeNode && (<any>this.blockqouteNodes[index]).removeNode(true);
        }
    }
    private blockqouteNodes: Array<HTMLElement> = [];
    private _cleanup(node: HTMLElement): void {
        let temp: HTMLElement, prevflagState: boolean;
        for (let index = 0; index < node.childNodes.length; index++) {
            if (this.ignorableNodes.indexOf(node.childNodes[index].nodeName) == -1 ||
                (node.childNodes[index].nodeType == 3 && node.childNodes[index].textContent.trim() == '')) {
                this.tempCleaner.push(node.childNodes[index]);
                continue;
            }
            else if ((<HTMLElement>node.childNodes[index]).className &&
                (<HTMLElement>node.childNodes[index]).className.toLowerCase().indexOf("msoquote") != -1) {
                this.blockqouteNodes.push((<HTMLElement>node.childNodes[index]));
            }
            else if ((<HTMLElement>node.childNodes[index]).className &&
                (<HTMLElement>node.childNodes[index]).className.toLowerCase().indexOf("msolistparagraph") != -1) {
                this.listNodes.push(<HTMLElement>node.childNodes[index]);
            }
            if (prevflagState &&(this.blockNode.indexOf(node.childNodes[index].nodeName.toLowerCase())!=-1) && !((<HTMLElement>node.childNodes[index]).className &&
                (<HTMLElement>node.childNodes[index]).className.toLowerCase().indexOf("msolistparagraph") != -1))
                this.listNodes.push(null);
            if(this.blockNode.indexOf(node.childNodes[index].nodeName.toLowerCase())!=-1)
                if ((<HTMLElement>node.childNodes[index]).className &&
                    (<HTMLElement>node.childNodes[index]).className.toLowerCase().indexOf("msolistparagraph") != -1)
                    prevflagState = true;
                else
                    prevflagState = false;
        }
		if(this.listNodes.length && (this.listNodes[this.listNodes.length-1]!=null)){
			this.listNodes.push(null);
		}
    }
    private _finalCleanup(node: HTMLElement): void{
        let temp: HTMLElement, elemCollection: Array<HTMLElement>=[];
        for (let index = 0; index < node.childNodes.length; index++)
        {
            if(node.childNodes[index] && node.childNodes[index].nodeType!=3 
                && (this.blockNode.indexOf(node.childNodes[index].nodeName.toLowerCase())!=-1)
                && (<HTMLElement>node.childNodes[index]).innerHTML 
                && ((<HTMLElement>node.childNodes[index]).innerHTML.trim() ==""))
            elemCollection.push(<HTMLElement>node.childNodes[index]);
        }
       while(temp=elemCollection.shift())
            this._remove(temp);

    }
    private _getlistStyle(listType: string, level: number): string {
        level = (level > 0) ? level - 1 : level;

        if (listType == 'ol')
            return (level < this.olData.length ? this.olData[level] : this.olData[0]);
        else
            return (level < this.ulData.length ? this.ulData[level] : this.ulData[0]);
    }
    private tempCleaner: Array<Node> = []
    private _cleanElement(elem: Node) {
        let temp: HTMLElement;
        if (elem.nodeType == 3) {
            if (elem.textContent.trim() == '')
                this.tempCleaner.push(elem);
        }
        else if (elem && this.ignorableNodes.indexOf(elem.nodeName) == -1) {
            this.tempCleaner.push(elem);
        }
        if (elem = elem.firstChild)
            do {
                this._cleanElement(elem);
            }
            while (elem = elem.nextSibling)
    }
    private _cleanStyles(elem: Node) {
        let temp: HTMLElement;
        if (elem && elem.nodeType != 3) {
            this._cleanCSSClass(<HTMLElement>elem);
            this._cleanCSSStyle(<HTMLElement>elem);
            if ((elem.nodeName == "SPAN")
                && !elem.attributes.getNamedItem("style")
                && !elem.attributes.getNamedItem("class")) {
                this.tempCleaner.push(elem);
            }
            else if ((elem.nodeName == "FONT") //content style handling for the less than ie10 browser.
                && this.filterOptions.removeStyles) {
                this.tempCleaner.push(elem);
            }
        }
        if(elem=elem.firstChild)
        do{
            this._cleanStyles(elem);
        }
        while(elem=elem.nextSibling)      
    }
    private ignorableNodes: Array<string> = ["A", "APPLET", "B", "BLOCKQUOTE",
        "BR", "BUTTON", "CENTER", "CODE", "COL", "COLGROUP", "DD", "DEL", "DFN", "DIR", "DIV", "DL", "DT", "EM",
        "FIELDSET", "FONT", "FORM", "FRAME", "FRAMESET", "H1", "H2", "H3", "H4", "H5", "H6", "HR", "I","IMG",
        "IFRAME", "INPUT", "INS", "LABEL", "LI", "OL", "OPTION", "P", "PARAM", "PRE", "Q",
        "S", "SELECT", "SPAN", "STRIKE", "STRONG", "SUB", "SUP", "TABLE", "TBODY", "TD", "TEXTAREA", "TFOOT", "TH", "THEAD", "TITLE", "TR"
        , "TT", "U", "UL"];

    private listNodes: Array<HTMLElement> = [];
    private ulData: Array<string> = [
        "disc",
        "square",
        "circle",
        "disc",
        "square",
        "circle"
    ]
    private olData: Array<string> = [
        "decimal",
        "lower-alpha",
        "lower-roman",
        "upper-alpha",
        "upper-roman",
        "lower-greek"
    ]
    private _cleanCSSClass(elem: HTMLElement): void {
        if (elem.attributes && elem.attributes.getNamedItem("class") && (this.filterOptions.cleanCSS || this.filterOptions.removeStyles)) {
            let classData: Array<string> = elem.className.split(" "), finalClases: string = '', attrib: Attr;
            for (let index = 0; index < classData.length; index++) {
                if (classData[index].toLowerCase().indexOf("mso") == -1 && this.filterOptions.cleanCSS) {
                    finalClases += classData[index] + " ";
                }
            }
            if (finalClases.length && !this.filterOptions.removeStyles) {
                attrib = this.currentDocument.createAttribute("class");
                attrib.value = finalClases;
                elem.attributes.setNamedItem(attrib);
            }
            else
                elem.attributes.removeNamedItem("class");
        }
    }
    private _cleanCSSStyle(elem: HTMLElement): void {
        if (elem.attributes && elem.attributes.getNamedItem("style") && (this.filterOptions.cleanCSS || this.filterOptions.removeStyles)) {
            let styleData: Array<string> = elem.attributes.getNamedItem("style").textContent.split(";"), finalCss: string = '', attrib: Attr;
            for (let index = 0; index < styleData.length; index++) {
                if (styleData[index].toLowerCase().indexOf("mso") == -1) {
                    finalCss += styleData[index] + ";";
                }
            }
            if (finalCss.length && !this.filterOptions.removeStyles) {
                attrib = this.currentDocument.createAttribute("style");
                attrib.value = finalCss;
                elem.attributes.setNamedItem(attrib);
            }
            else
                elem.attributes.removeNamedItem("style");
            
            if(elem.attributes.getNamedItem("align")&& !(elem.tagName==="FONT"))
                elem.attributes.removeNamedItem("align");
            
        }
    }    
    private _remove(elem: HTMLElement): void {
        if(elem)
            if(elem.remove)
                elem.remove();
            else if((<any>elem).removeNode)
                (<any>elem).removeNode(true);
            else if(elem.textContent)
                elem.textContent="";
    }    
}
$.extend(ej,{"clipboardCleaner":clipboardCleaner});

window["ClipboardCleaner"] = undefined;
interface nodeformat {
    content: HTMLElement;
    node: HTMLElement;
}
interface NodeDatas {
    type: string;
    content: Node;
    level: number;
}
interface FilterModel {
    listConversion: Boolean;
    cleanCSS: Boolean;
    removeStyles: Boolean;
    cleanElements: Boolean;
}
interface ClipboardData {
    plain: string;
    rtf: string;
    html: string;
}
interface GeneratedNodes{
    leaf:Node;
    root:Node;
}
