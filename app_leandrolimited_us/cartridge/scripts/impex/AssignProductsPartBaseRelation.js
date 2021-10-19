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
function assignRelation(jobParameters){
	var csvFileName = jobParameters.csvFileName;
	var catalogID = jobParameters.catalogID;
	var srcCatalogPath = "catalog" + File.SEPARATOR;
	var impexCatalogPath = [File.IMPEX, "src", "catalog", ""].join(File.SEPARATOR);
	var productMap : List = (new CSVStreamReader((new FileReader(new File(impexCatalogPath + csvFileName), "utf-8")), ",", "\"", 1)).readAll();
	var catalogXmlFileName = catalogID + "-part-base-relation-" + (new Date()).getTime().toString() + ".xml";
	var catalogXmlWriter : XMLIndentingStreamWriter = new XMLIndentingStreamWriter(new FileWriter(new File(impexCatalogPath + catalogXmlFileName), "UTF-8"));
	
	var relation = getRelationship(productMap);
	
	generateCatalogXML(catalogID, catalogXmlWriter, relation);
}

/*
 * From productMap generate an object with 2 arrays of baseParts and partBases relationship
 * */
function getRelationship(productMap){
	var baseParts = [], partBases = [], product;
	
	for each(product in productMap){
		baseParts = updateBaseParts(baseParts, product);
		partBases = updatePartBases(partBases, product);
	}
	
	return {
		"baseParts": baseParts,
		"partBases": partBases
	};
}

/*
 * Update base Parts relationship array
 * */
function updateBaseParts(basePartsArray, productIDs){
	var baseProductID = productIDs[1],
		partProductID = productIDs[0],
		baseExists = false,
		relation;
	
	for each(relation in basePartsArray){
		if(relation.base == baseProductID){
			relation.parts.push(partProductID);
			baseExists = true;
			break;
		}
	}
	
	if(!baseExists){
		basePartsArray.push({
			base: baseProductID,
			parts: [partProductID]
		});
	}
	
	return basePartsArray;
}

/*
 * Update part bases relationship array
 * */
function updatePartBases(partBasesArray, productIDs){
	var baseProductID = productIDs[1],
		partProductID = productIDs[0],
		partExists = false,
		relation;
	
	for each(relation in partBasesArray){
		if(relation.part == partProductID){
			relation.bases.push(baseProductID);
			partExists = true;
			break;
		}
	}
	
	if(!partExists){
		partBasesArray.push({
			part: partProductID,
			bases: [baseProductID]
		});
	}
	
	return partBasesArray;
}

/*
 * Generate catalog XML file from CSV
 * */
function generateCatalogXML(catalogID, catalogXmlWriter, relation){
	var product, family, base, part,
		basePartsRelation = relation.baseParts,
		partBasesRelation = relation.partBases;
	
	catalogXmlWriter.writeStartDocument();
	catalogXmlWriter.writeStartElement("catalog");
	catalogXmlWriter.writeAttribute("xmlns", "http://www.demandware.com/xml/impex/catalog/2006-10-31");
	catalogXmlWriter.writeAttribute("catalog-id", catalogID);
	
	for each(family in basePartsRelation){
		catalogXmlWriter.writeStartElement("product");
		catalogXmlWriter.writeAttribute("product-id", family.base);
			
			catalogXmlWriter.writeStartElement("custom-attributes");
				
				catalogXmlWriter.writeStartElement("custom-attribute");
				catalogXmlWriter.writeAttribute("attribute-id", "parts");
				
					for each(part in family.parts){
						catalogXmlWriter.writeStartElement("value");
							catalogXmlWriter.writeCharacters(part);
						catalogXmlWriter.writeEndElement();//value
					}
					
				catalogXmlWriter.writeEndElement();//custom-attribute
				
			catalogXmlWriter.writeEndElement();//custom-attributes
		
		catalogXmlWriter.writeEndElement();//product
	}
	
	for each(family in partBasesRelation){
		catalogXmlWriter.writeStartElement("product");
		catalogXmlWriter.writeAttribute("product-id", family.part);
			
			catalogXmlWriter.writeStartElement("custom-attributes");
				
				catalogXmlWriter.writeStartElement("custom-attribute");
				catalogXmlWriter.writeAttribute("attribute-id", "baseModel");
				
					for each(base in family.bases){
						catalogXmlWriter.writeStartElement("value");
							catalogXmlWriter.writeCharacters(base);
						catalogXmlWriter.writeEndElement();//value
					}
					
				catalogXmlWriter.writeEndElement();//custom-attribute
				
			catalogXmlWriter.writeEndElement();//custom-attributes
		
		catalogXmlWriter.writeEndElement();//product
	}
	
	catalogXmlWriter.writeEndElement();//catalog
	catalogXmlWriter.writeEndDocument();
	
	catalogXmlWriter.flush();
	catalogXmlWriter.close();
}

/*
 * Expose methods
 */
/*
 * Trigger import logic from job ImportCatalogCSV
 * */
module.exports.AssignRelation = assignRelation;
