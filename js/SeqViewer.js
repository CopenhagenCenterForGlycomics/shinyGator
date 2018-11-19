import { getData } from './gator';

import MASCP from 'mascp-jstools';

const retrieve_uniprot = function(uniprot) {
  return MASCP.GatorDataReader.authenticate().then(function(url_base) {
    let a_reader = new MASCP.UniprotReader();
    return new Promise((resolve,reject) => {
    a_reader.retrieve(uniprot, function(err) {
      resolve(this.result._raw_data.data[0]);
    });
    });
  });
};

const set_sequence = function(uniprot) {
  return retrieve_uniprot(uniprot).then (seq => {
    let viewer = document.querySelector('x-protviewer');
    viewer.uniprot = uniprot;
    return new Promise( resolve => {
      let resolver = () => {
        viewer.renderer.unbind('sequenceChange',resolver);
        viewer.refreshTracks();
        viewer.fitToZoom();
        for (let track of viewer.querySelectorAll('x-gatortrack')) {
          track.setAttribute('scale',uniprot);
        }
        resolve();
      };
      viewer.renderer.bind('sequenceChange',resolver);
      viewer.renderer.setSequence(seq);
    });
  });
};



const tmpl = document.createElement('template');

tmpl.innerHTML = `
<x-protviewer id="protview" interactive>
    <x-gatortrack name="domains" fullname="Domains" scale="uniprot" ></x-gatortrack>
    <x-gatortrack name="ptms" fullname="PTMS" scale="uniprot" ></x-gatortrack>
    <x-gatortrack name="data" fullname="Data" scale="uniprot" ></x-gatortrack>
</x-protviewer>
<x-trackrenderer track="domains" src="lib/renderers-1.0.0/glycodomain.packed.renderer.js" renderer="protview">
</x-trackrenderer>
<x-trackrenderer track="ptms" src="lib/renderers-1.0.0/msdata.packed.renderer.js" renderer="protview">
</x-trackrenderer>
<x-trackrenderer track="data" renderer="protview">
</x-trackrenderer>
`;

const render_domains = (value) => {
  return getData('glycodomain',value).then( dat => {
    document.querySelector('x-trackrenderer[track="domains"]').data = dat._raw_data.data;
  });
};

const render_ptm_data = (value) => {
  return getData('combined',value).then( dat => {
    document.querySelector('x-trackrenderer[track="ptms"]').data = dat._raw_data.data;
  });
};


HTMLWidgets.widget({

  name: 'SeqViewer',

  type: 'output',

  factory: function(el, width, height) {

    let viewer = null;

    return {

      renderValue: function(input) {

        if ( ! viewer ) {
          let new_viewer = tmpl.content.cloneNode(true);
          el.appendChild(new_viewer);
          viewer = document.getElementById('protview');
        }

        set_sequence(input.message.toUpperCase()).then( () => {
          render_domains(input.message.toUpperCase());
          render_ptm_data(input.message.toUpperCase());
        });
      },

      resize: function(width, height) {

        // TODO: code to re-render the widget with a new size

      }

    };
  }
});