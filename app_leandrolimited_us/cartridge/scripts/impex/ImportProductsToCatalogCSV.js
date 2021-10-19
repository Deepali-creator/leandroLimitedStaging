/**
* Demandware Script File
*
*/
importPackage( dw.system );
importPackage( dw.io );

var log = Logger;
var columns = {};
/*
 * Triggers file conversion method and import method 
 * */
function importCatalogCSV(jobParameters){
	var csvFileName = jobParameters.csvFileName;
	var catalogID = jobParameters.catalogID;
	var pricebookID = jobParameters.pricebookID;
	var impexCatalogPath = [File.IMPEX, "src", "catalog", ""].join(File.SEPARATOR);
	var productMap : List = (new CSVStreamReader((new FileReader(new File(impexCatalogPath + csvFileName), "utf-8")), ",", "\"")).readAll();
	var catalogXmlFileName = catalogID + "-catalog-" + (new Date()).getTime().toString() + ".xml";
	var pricebookXmlFileName = pricebookID + "-pricebook-" + (new Date()).getTime().toString() + ".xml";

	determineColumns(productMap.shift());
	generateCatalogXML(catalogID, new XMLIndentingStreamWriter(new FileWriter(new File(impexCatalogPath + catalogXmlFileName), "UTF-8")), productMap);
	generatePricebookXML(pricebookID, new XMLIndentingStreamWriter(new FileWriter(new File(impexCatalogPath + pricebookXmlFileName), "UTF-8")), productMap);
	
	//import catalog
	var Pipeline = require('dw/system/Pipeline');
	var importCatalogResult = Pipeline.execute('BasicImports-Catalog', {
		ImportFile: "catalog" + File.SEPARATOR + catalogXmlFileName,
		ImportMode: 'MERGE'
	});
	
	if(importCatalogResult.Status.status == dw.system.Status.ERROR){
		log.error("Error on importing catalog '"+ catalogXmlFileName +"': " + importCatalogResult.ErrorMsg);
	}
	
	//impor pricebook
	var importPricebooksResult = Pipeline.execute('BasicImports-Pricebooks', {
		ImportFile: "catalog" + File.SEPARATOR + pricebookXmlFileName,
		ImportMode: 'MERGE'
	});
	
	if(importPricebooksResult.Status.status == dw.system.Status.ERROR){
		log.error("Error on importing catalog '"+ pricebookXmlFileName +"': " + importPricebooksResult.ErrorMsg);
	}
}

function determineColumns(headerColumn : Array){
	columns.product_code=headerColumn.indexOf("product_code");
	columns.list_price=headerColumn.indexOf("list_price");
	columns.weight=headerColumn.indexOf("weight");
	columns.length=headerColumn.indexOf("length");
	columns.width=headerColumn.indexOf("width");
	columns.height=headerColumn.indexOf("height");
	columns.min_qty=headerColumn.indexOf("min_qty");
	columns.max_qty=headerColumn.indexOf("max_qty");
	columns.product=headerColumn.indexOf("product");
	columns.full_description=headerColumn.indexOf("full_description");
	columns.meta_keywords=headerColumn.indexOf("meta_keywords");
	columns.meta_description=headerColumn.indexOf("meta_description");
	columns.page_title=headerColumn.indexOf("page_title");
	columns.price=headerColumn.indexOf("price");
	columns.seo_name=headerColumn.indexOf("seo_name");
}

/*
 * Generate catalog XML file from CSV
 * */
function generateCatalogXML(catalogID, catalogXmlWriter, productMap){
	var product;
	
	catalogXmlWriter.writeStartDocument();
	catalogXmlWriter.writeStartElement("catalog");
	catalogXmlWriter.writeAttribute("xmlns", "http://www.demandware.com/xml/impex/catalog/2006-10-31");
	catalogXmlWriter.writeAttribute("catalog-id", catalogID);
	
	for each(product in productMap){
		if(!empty(product[columns.product_code])){
			catalogXmlWriter.writeStartElement("product");
			catalogXmlWriter.writeAttribute("product-id", product[columns.product_code]);
				
				if(!empty(product[columns.product])){
					catalogXmlWriter.writeStartElement("display-name");
					catalogXmlWriter.writeAttribute("xml:lang", "x-default");
					catalogXmlWriter.writeCharacters(product[columns.product]);//product display name
					catalogXmlWriter.writeEndElement();
				}
				
				if(!empty(product[columns.full_description])){
					catalogXmlWriter.writeStartElement("long-description");
					catalogXmlWriter.writeAttribute("xml:lang", "x-default");
					catalogXmlWriter.writeCharacters(product[columns.full_description]);
					catalogXmlWriter.writeEndElement();
				}
				
				catalogXmlWriter.writeStartElement("page-attributes");
					if(!empty(product[columns.page_title])){
						catalogXmlWriter.writeStartElement("page-title");
						catalogXmlWriter.writeAttribute("xml:lang", "x-default");
						catalogXmlWriter.writeCharacters(product[columns.page_title]);
						catalogXmlWriter.writeEndElement();
					}
					
					if(!empty(product[columns.meta_description])){
						catalogXmlWriter.writeStartElement("page-description");
						catalogXmlWriter.writeAttribute("xml:lang", "x-default");
						catalogXmlWriter.writeCharacters(product[columns.meta_description]);
						catalogXmlWriter.writeEndElement();
					}
					
					if(!empty(product[columns.meta_keywords])){
						catalogXmlWriter.writeStartElement("page-keywords");
						catalogXmlWriter.writeAttribute("xml:lang", "x-default");
						catalogXmlWriter.writeCharacters(product[columns.meta_keywords]);
						catalogXmlWriter.writeEndElement();
					}
					
					if(!empty(product[columns.seo_name])){
						catalogXmlWriter.writeStartElement("page-url");
						catalogXmlWriter.writeAttribute("xml:lang", "x-default");
						catalogXmlWriter.writeCharacters(product[columns.seo_name])
						catalogXmlWriter.writeEndElement();
					}
				catalogXmlWriter.writeEndElement();//page-attributes
				
				catalogXmlWriter.writeStartElement("custom-attributes");
					if(!empty(product[columns.height])){
						catalogXmlWriter.writeStartElement("custom-attribute");
						catalogXmlWriter.writeAttribute("attribute-id", "dimHeight");
						catalogXmlWriter.writeCharacters(product[columns.height]);
						catalogXmlWriter.writeEndElement();
					}
					
					if(!empty(product[columns.weight])){
						catalogXmlWriter.writeStartElement("custom-attribute");
						catalogXmlWriter.writeAttribute("attribute-id", "dimWeight");
						catalogXmlWriter.writeCharacters(product[columns.weight]);
						catalogXmlWriter.writeEndElement();
					}
					
					if(!empty(product[columns.width])){
						catalogXmlWriter.writeStartElement("custom-attribute");
						catalogXmlWriter.writeAttribute("attribute-id", "dimWidth");
						catalogXmlWriter.writeCharacters(product[columns.width]);
						catalogXmlWriter.writeEndElement();
					}
					
					if(!empty(product[columns.length])){
						catalogXmlWriter.writeStartElement("custom-attribute");
						catalogXmlWriter.writeAttribute("attribute-id", "displaySize");
						catalogXmlWriter.writeCharacters(product[columns.length]);
						catalogXmlWriter.writeEndElement();
					}
				catalogXmlWriter.writeEndElement();//custom-attributes
			
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
 * Generate pricebook XML file from CSV
 * */
function generatePricebookXML(pricebookID, pricebookXmlWriter, productMap){
	var product;
	
	pricebookXmlWriter.writeStartDocument();
	pricebookXmlWriter.writeStartElement("pricebooks");
	pricebookXmlWriter.writeAttribute("xmlns", "http://www.demandware.com/xml/impex/pricebook/2006-10-31");
		pricebookXmlWriter.writeStartElement("pricebook");
		
			pricebookXmlWriter.writeStartElement("header");
			pricebookXmlWriter.writeAttribute("pricebook-id", pricebookID);
				pricebookXmlWriter.writeStartElement("currency");
				pricebookXmlWriter.writeCharacters(getCurrencyCodeFromPricebookID(pricebookID));
				pricebookXmlWriter.writeEndElement();//currency
			pricebookXmlWriter.writeEndElement();//header
			
			pricebookXmlWriter.writeStartElement("price-tables");
			
			for each(product in productMap){
				if(!empty(product[columns.product_code]) && !empty(product[columns.price])){
					pricebookXmlWriter.writeStartElement("price-table");
					pricebookXmlWriter.writeAttribute("product-id", product[columns.product_code]);
						pricebookXmlWriter.writeStartElement("amount");
						pricebookXmlWriter.writeAttribute("quantity", "1");
						pricebookXmlWriter.writeCharacters(product[columns.price]);
						pricebookXmlWriter.writeEndElement();//amount
					pricebookXmlWriter.writeEndElement();//price-table
				}
			}
			
			pricebookXmlWriter.writeEndElement();//price-tables
		pricebookXmlWriter.writeEndElement();//pricebook
	pricebookXmlWriter.writeEndElement();//pricebooks
	pricebookXmlWriter.writeEndDocument();
	
	pricebookXmlWriter.flush();
	pricebookXmlWriter.close();
}

/*
 * Get Currency Code from pricebookID
 * */
function getCurrencyCodeFromPricebookID(pricebookID){
	var splitText = pricebookID.split("-");
	var currencyCode = empty(splitText[0]) ? 'GBP' : splitText[0].toUpperCase();
	
	return currencyCode;
}

/*
 * Expose methods
 */
/*
 * Trigger import logic from job ImportCatalogCSV
 * */
module.exports.ImportCatalog = importCatalogCSV;
