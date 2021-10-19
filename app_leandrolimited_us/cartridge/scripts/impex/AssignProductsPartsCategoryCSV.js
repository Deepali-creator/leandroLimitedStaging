/**
* Demandware Script File
*
*/
importPackage( dw.system );
importPackage( dw.io );

var log = Logger;
/*
 * Triggers file conversion method and import method 
 * */
function assignProductsCSV(jobParameters){
	var csvFileName = jobParameters.csvFileName;
	var catalogID = jobParameters.catalogID;
	var srcCatalogPath = "catalog" + File.SEPARATOR;
	var impexCatalogPath = [File.IMPEX, "src", "catalog", ""].join(File.SEPARATOR);
	var productMap : List = (new CSVStreamReader((new FileReader(new File(impexCatalogPath + csvFileName), "utf-8")), ",", "\"", 1)).readAll();
	var catalogXmlFileName = catalogID + "-catalog-" + (new Date()).getTime().toString() + ".xml";
	var catalogXmlWriter : XMLIndentingStreamWriter = new XMLIndentingStreamWriter(new FileWriter(new File(impexCatalogPath + catalogXmlFileName), "UTF-8"));
	
	generateCatalogXML(catalogID, catalogXmlWriter, productMap);
}

/*
 * Generate catalog XML file from CSV
 * */
function generateCatalogXML(catalogID, catalogXmlWriter, productMap){
	var product,
		productIds = [],
		singleCategoryID = "parts";
	
	catalogXmlWriter.writeStartDocument();
	catalogXmlWriter.writeStartElement("catalog");
	catalogXmlWriter.writeAttribute("xmlns", "http://www.demandware.com/xml/impex/catalog/2006-10-31");
	catalogXmlWriter.writeAttribute("catalog-id", catalogID);
	
	for each(product in productMap){
		if(!empty(product[0]) && !productAlreadyAssigned(productIds, product[0])){
			catalogXmlWriter.writeStartElement("category-assignment");
			catalogXmlWriter.writeAttribute("category-id", singleCategoryID);
			catalogXmlWriter.writeAttribute("product-id", product[0]);
				catalogXmlWriter.writeStartElement("position");
					catalogXmlWriter.writeCharacters("auto");
				catalogXmlWriter.writeEndElement();//position
			catalogXmlWriter.writeEndElement();//category-assignment
			
			productIds.push(product[0]);//keep productID in already assigned list
		}
	}
	
	catalogXmlWriter.writeEndElement();//catalog
	catalogXmlWriter.writeEndDocument();
	
	catalogXmlWriter.flush();
	catalogXmlWriter.close();
}

/*
 * check if product id already exists in array
 * */
function productAlreadyAssigned(arrProductIDs, productID){
	var product,
		exists = false;
	
	for each(product in arrProductIDs){
		if(product == productID){
			exists = true;
			break;
		}
	}
	
	return exists;
}

/*
 * Expose methods
 */
/*
 * Trigger assign products to single category logic from job AssignProductsPartsCategoryCSV
 * */
module.exports.AssignProducts = assignProductsCSV;
