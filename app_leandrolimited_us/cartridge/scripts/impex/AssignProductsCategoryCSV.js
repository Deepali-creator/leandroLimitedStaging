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
	var masterCatalogID = jobParameters.masterCatalogID;
	var storefrontCatalogID = jobParameters.storefrontCatalogID;
	var srcCatalogPath = "catalog" + File.SEPARATOR;
	var impexCatalogPath = File.IMPEX + File.SEPARATOR + "src" + File.SEPARATOR + srcCatalogPath;
	var productMap : List = (new CSVStreamReader((new FileReader(new File(impexCatalogPath + csvFileName), "utf-8")), ",", "\"", 1)).readAll();
	var masterCatalogXmlFileName = masterCatalogID + "-catalog-" + (new Date()).getTime().toString() + ".xml";
	var storefrontCatalogXmlFileName = storefrontCatalogID + "-catalog-" + (new Date()).getTime().toString() + ".xml";
	var masterCatalogXmlWriter : XMLIndentingStreamWriter = new XMLIndentingStreamWriter(new FileWriter(new File(impexCatalogPath + masterCatalogXmlFileName), "UTF-8"));
	var storefrontCatalogXmlWriter : XMLIndentingStreamWriter = new XMLIndentingStreamWriter(new FileWriter(new File(impexCatalogPath + storefrontCatalogXmlFileName), "UTF-8"));
	
	generateMasterCatalogXML(masterCatalogID, masterCatalogXmlWriter, productMap);
	generateStorefrontCatalogXML(storefrontCatalogID, storefrontCatalogXmlWriter, productMap);
}

/*
 * Generate master catalog XML file from CSV
 * */
function generateMasterCatalogXML(catalogID, catalogXmlWriter, productMap){
	var product;
	
	catalogXmlWriter.writeStartDocument();
	catalogXmlWriter.writeStartElement("catalog");
	catalogXmlWriter.writeAttribute("xmlns", "http://www.demandware.com/xml/impex/catalog/2006-10-31");
	catalogXmlWriter.writeAttribute("catalog-id", catalogID);
	
	for each(product in productMap){
		if(!empty(product[1])){
			catalogXmlWriter.writeStartElement("product");
			catalogXmlWriter.writeAttribute("product-id", product[1]);
				
				if(!empty(product[2])){
					catalogXmlWriter.writeStartElement("display-name");
					catalogXmlWriter.writeAttribute("xml:lang", "x-default");
					catalogXmlWriter.writeCharacters(product[2]);//product_name
					catalogXmlWriter.writeEndElement();
				}
				
				if(!empty(product[3])){
					catalogXmlWriter.writeStartElement("long-description");
					catalogXmlWriter.writeAttribute("xml:lang", "x-default");
					catalogXmlWriter.writeCharacters(product[3]);//description
					catalogXmlWriter.writeEndElement();
				}
				
				catalogXmlWriter.writeStartElement("page-attributes");
					if(!empty(product[6])){
						catalogXmlWriter.writeStartElement("page-title");
						catalogXmlWriter.writeAttribute("xml:lang", "x-default");
						catalogXmlWriter.writeCharacters(product[6]);//page_title
						catalogXmlWriter.writeEndElement();
					}
					
					if(!empty(product[5])){
						catalogXmlWriter.writeStartElement("page-description");
						catalogXmlWriter.writeAttribute("xml:lang", "x-default");
						catalogXmlWriter.writeCharacters(product[5]);//meta_description
						catalogXmlWriter.writeEndElement();
					}
					
					if(!empty(product[4])){
						catalogXmlWriter.writeStartElement("page-keywords");
						catalogXmlWriter.writeAttribute("xml:lang", "x-default");
						catalogXmlWriter.writeCharacters(product[4]);//meta_keywords
						catalogXmlWriter.writeEndElement();
					}
				catalogXmlWriter.writeEndElement();//page-attributes		
			catalogXmlWriter.writeEndElement();//product
		}
		else{
			log.error("Product not imported: " + product.join(","));
		}
	}
	
	catalogXmlWriter.writeEndElement();//catalog
	catalogXmlWriter.writeEndDocument();
	
	catalogXmlWriter.flush();
	catalogXmlWriter.close();
}

/*
 * Generate storefront catalog XML file from CSV
 * */
function generateStorefrontCatalogXML(catalogID, catalogXmlWriter, productMap){
	var product,
		categoryID;
	
	catalogXmlWriter.writeStartDocument();
	catalogXmlWriter.writeStartElement("catalog");
	catalogXmlWriter.writeAttribute("xmlns", "http://www.demandware.com/xml/impex/catalog/2006-10-31");
	catalogXmlWriter.writeAttribute("catalog-id", catalogID);
	
	for each(product in productMap){
		if(!empty(product[0]) && !empty(product[1])){
			categoryID = getCategoryIDfromName(product[0]);
			catalogXmlWriter.writeStartElement("category-assignment");
			catalogXmlWriter.writeAttribute("category-id", categoryID);
			catalogXmlWriter.writeAttribute("product-id", product[1]);
				catalogXmlWriter.writeStartElement("position");
					catalogXmlWriter.writeCharacters("auto");
				catalogXmlWriter.writeEndElement();//position
			catalogXmlWriter.writeEndElement();//category-assignment
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
function getCategoryIDfromName(categoryName){
	var categoryID = categoryName.toLowerCase();
	
	categoryID = dw.util.StringUtils.trim(categoryID);
	
	categoryID = categoryID.replace(/&/g, "");
	categoryID = categoryID.replace(/'/g, "");
	categoryID = categoryID.replace(/-/g, "");
	categoryID = categoryID.replace(/ _ /g, "_");
	
	//convert all double spaces to single space
	while(categoryID.indexOf('  ') > -1){
		categoryID = categoryID.replace(/  /g, " ");
	}
	
	categoryID = categoryID.replace(/ /g, "_");
	
	return categoryID;
}

/*
 * Expose methods
 */
/*
 * Trigger assign products to single category logic from job AssignProductsPartsCategoryCSV
 * */
module.exports.AssignProducts = function(jobParameters){
	assignProductsCSV(jobParameters);
}
