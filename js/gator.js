import MASCP from 'mascp-jstools';

MASCP.GatorDataReader.anonymous = true;

MASCP.GatorDataReader.server = 'https://glycodomain.glycomics.ku.dk';

MASCP.AUTH0_CLIENT_ID='fNED1UGvPaP0XlrcEvWsHXIODIKy6WVB';
MASCP.GATOR_CLIENT_ID=MASCP.AUTH0_CLIENT_ID;

let getData = function(dataset,accession) {
  return MASCP.GatorDataReader.authenticate().then(function(url_base) {
    let a_reader = MASCP.GatorDataReader.createReader(dataset);
    a_reader.datasetname = dataset;
    return new Promise((resolve,reject) => {
      a_reader.retrieve(accession, function(err) {
        resolve(this.result);
      });
    });
  });
};

let getMetadata = function(dataset) {
  return MASCP.GatorDataReader.authenticate().then(function(url_base) {
    let headers = new Headers();
    headers.append('Authorization','Bearer '+MASCP.GATOR_AUTH_TOKEN);
    headers.append('x-api-key',MASCP.GATOR_CLIENT_ID);
    let req_params = {
      method: 'GET',
      headers: headers
    };
    let req = new Request(`${url_base}/metadata/${dataset}`, req_params);
    return fetch(req).then( resp => resp.json());
  });
};

let hydrate_expression = (metadata,dat) => {
  let values = dat._raw_data.data;
  let locations = metadata.locations;
  locations.forEach( (loc,idx) => loc.expression = values[idx] );
  return locations;
}

let getExpression = (dataset,geneid) => {
  return getMetadata(dataset).then( meta => {
    return getData(dataset,geneid).then( hydrate_expression.bind(null,meta) );
  });
}


export { getMetadata, getData, getExpression };