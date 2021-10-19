/**
* Demandware Script File
*
*/
 
 importPackage( dw.system );
 importPackage( dw.order );
 importPackage( dw.util );
 importPackage( dw.web );
 importPackage( dw.net );
 importPackage( dw.object );
 importPackage( dw.io );
 importPackage( dw.catalog );
 
var XML_NAMESPACE : String = "http://www.demandware.com/xml/impex/catalog/2006-10-31";
var wrongImageNames = [];

function assignImages(jobParameters) {

	
	var catalogid : String = jobParameters.masterCatalogID;

	var newdir : File = new File([File.IMPEX, "src", "imageassign"].join(File.SEPARATOR));
	var importfilename : String = [File.IMPEX, "src", "catalog", "assignimages_"+ catalogid +".xml"].join(File.SEPARATOR);
	var productimages : dw.util.HashMap = new dw.util.HashMap();

	newdir.mkdirs();

	try {

		var folder : dw.io.File = new dw.io.File([File.CATALOGS, catalogid, "default", "sparesbabyliss"].join(File.SEPARATOR));
		
		if (folder.exists() && folder.directory) {
			var list = folder.listFiles();
		}
		var xsw : XMLStreamWriter = initXML(new File(importfilename), catalogid);
		var filesiterator = list.iterator();
		
		while (filesiterator.hasNext()) {
			var file = filesiterator.next();
			collectFile(productimages,file.name);
		}
		
		for each (var key in productimages.keySet()){
			writeProduct(xsw,key,productimages.get(key));
		}
		
        finalizeFeed(xsw);
    } catch(ex) {
    	Logger.error("Exception: " + ex.message);
    }
    
    Logger.error("List of wrong filenames");
    Logger.error(wrongImageNames.toString());
}



function writeProduct(xsw : XMLStreamWriter, pid: String, images : dw.util.ArrayList) {
	/*
	var filename_nosuffix = filename.substr(0,filename.lastIndexOf('.'));
	var productid = getProductID(filename_nosuffix);
	var suffix = filename.substr(filename.lastIndexOf('.'));
	var product : dw.catalog.Product = dw.catalog.ProductMgr.getProduct(productid);
	*/
	//if (!empty(product)) {
		xsw.writeStartElement("product");
		xsw.writeAttribute("product-id", pid);
		xsw.writeStartElement("images");

		xsw.writeStartElement("image-group");
		xsw.writeAttribute("view-type", "hi-res");
		
		for each (var filename in images) {
			xsw.writeStartElement("image");
			xsw.writeAttribute("path", filename);
			xsw.writeEndElement(); //image
		}
		xsw.writeEndElement(); //image-group
		xsw.writeEndElement(); //images
	    xsw.writeEndElement(); //product
	//}
}

/*
* Initializes XML Stream
*/

function initXML(file : File, catalogid: String) : XMLStreamWriter {
    var fw : FileWriter = new FileWriter(file);
    var xsw : XMLIndentingStreamWriter = new XMLIndentingStreamWriter(fw);
    
    
    xsw.writeStartDocument("UTF-8", "1.0");
    xsw.writeStartElement("catalog");
    xsw.writeAttribute("xmlns", XML_NAMESPACE);
    //xsw.writeAttribute("catalog-id", dw.catalog.CatalogMgr.siteCatalog.ID);
    xsw.writeAttribute("catalog-id", catalogid);
    return xsw;
}

/*
* Closes XML and Stream
*/

function finalizeFeed(xsw : XMLStreamWriter) {
    xsw.writeEndElement(); 
    xsw.writeEndDocument();
   
    xsw.flush();
    xsw.close();
}

function getProductID(filename : String) : String {
	var purifiedFilename = filename.replace(/\./g, "");
	
	purifiedFilename = purifiedFilename.replace(/ /g, "");
	
	var productID = purifiedFilename;
	var hyphenCount = (purifiedFilename.match(/_/g) || []).length;
	var product;
	
	if(hyphenCount == 1){//filename has 1 hyphen
		productID = purifiedFilename.split('_')[0];//get string part before hyphen
		product = ProductMgr.getProduct(productID);
		
		if(product){
			return productID;
		}
		else{
			productID = purifiedFilename.split('_')[1];//get string part after hyphen
		}
	}
	else if(hyphenCount > 1){
		productID = purifiedFilename.split('_')[0];//get string part before first hyphen
	}
	
	product = ProductMgr.getProduct(productID);
	
	if(product){
		return productID;
	}
	else if(productID.length > 20){
		var posThirteen = productID.indexOf("13", 4);//position of 13 in value after 5th character
		var posFourteen = productID.indexOf("14", 4);//position of 14 in value after 5th character
		
		if(posThirteen != -1){//position found for 13
			if(posFourteen != -1){//position found for 14
				if(posThirteen < posFourteen){//position of 13 is before 14
					productID = productID.split("13")[0];
				}
				else{//position of 13 is after 14
					productID = productID.split("14")[0];
				}
			}
			else{
				productID = productID.split("13")[0];
			}
		}
		else if(posFourteen != -1){//position found for 14, but no 13
			productID = productID.split("14")[0];
		}
	}
	
	product = ProductMgr.getProduct(productID);
	
	if(product){
		return productID;
	}
	
	wrongImageNames.push(filename);
	
	return null;
}

function collectFile(productimages: dw.util.HashMap, filename : String) {
	var filename_nosuffix = filename.substr(0,filename.lastIndexOf('.'));
	var productid = getProductID(filename_nosuffix);
	
	if(productid){
		var product : dw.catalog.Product = ProductMgr.getProduct(productid);
		
		if (!empty(product)) {
			var images = productimages.get(productid);
			if ( empty(images) ) {
				images = new dw.util.ArrayList();
			}
			if (!images.contains(filename)) {
				images.add(filename);
			}
			if (!images.isEmpty()) {
				productimages.put(productid,images);
			}
		}
	}
}

/*
 * Expose methods
 */
/*
 * Trigger assign products to single category logic from job AssignProductsPartsCategoryCSV
 * */
module.exports.AssignImages = assignImages;
