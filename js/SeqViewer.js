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

const set_sequence = function(el,uniprot) {
  return retrieve_uniprot(uniprot).then (seq => {
    let viewer = el.querySelector('x-protviewer');
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
<x-trackrenderer track="domains" renderer="protview"></x-trackrenderer>
<x-trackrenderer track="ptms" renderer="protview"></x-trackrenderer>
<x-trackrenderer track="data" renderer="protview"></x-trackrenderer>
`;

const render_domains = (el,value) => {
  return getData('glycodomain',value).then( dat => {
    el.querySelector('x-trackrenderer[track="domains"]').data = dat._raw_data.data;
  });
};

const render_ptm_data = (el,value) => {
  return getData('combined',value).then( dat => {
    el.querySelector('x-trackrenderer[track="ptms"]').data = dat._raw_data.data;
  });
};

const set_uniprot = (el,value) => {
  let value_uc = value.toUpperCase();
  set_sequence(el,value_uc).then( () => {
    render_domains(el,value_uc);
    render_ptm_data(el,value_uc);
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
          viewer = el.getElementsByTagName('x-protviewer').protview;
        }

        let params = input.message;

        if (params.interactive) {
          viewer.setAttribute('interactive','');
        }

        if ( ! params.ptms ) {
          let ptm_track = el.querySelector('x-gatortrack[name="ptms"]');
          ptm_track.parentNode.removeChild(ptm_track);
        }

        if ( ! params.domains ) {
          let domain_track = el.querySelector('x-gatortrack[name="domains"]');
          domain_track.parentNode.removeChild(domain_track);
        }

        // https://github.com/ramnathv/htmlwidgets/issues/71

        el.querySelector('x-trackrenderer[track="domains"]').setAttribute('src',HTMLWidgets.getAttachmentUrl('renderers', 'glycodomain.packed'));
        el.querySelector('x-trackrenderer[track="ptms"]').setAttribute('src',HTMLWidgets.getAttachmentUrl('renderers', 'msdata.packed'));
        set_uniprot(el,'Q14118');

        if (HTMLWidgets.shinyMode) {
          for (let method of ['setUniprot']) {
            Shiny.addCustomMessageHandler(`seqviewer:${method}`, function(message) {
              var el = document.getElementById(message.id);
              if (el) {
                set_uniprot(el,message.uniprot);
              }
            });
          }
        }

      },

      resize: function(width, height) {

        // TODO: code to re-render the widget with a new size

      }

    };
  }
});