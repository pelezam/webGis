$(function () {
    var mymap = L.map('myMap').setView([8.9374800,1.2122700], 7);
    var couches_layer = new L.LayerGroup();;

    $('.list_layers').DataTable( {
        "language": {
            "url": "/media/datatable_langue/French.json"
        },
    } );

    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
            '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox/streets-v11'
    }).addTo(mymap);

    $('.voir-couche').click(function (e) {
        e.preventDefault();
        let id = $(this).attr('data-id');
        $.get( "/layer/"+id+"/", function( data ) {
            couches_layer.clearLayers();
            let layer = L.geoJSON(data.geojson);
            couches_layer.addLayer(layer).addTo(mymap);
            mymap.fitBounds(layer.getBounds())
        });
    });


    $('.edit-couche').click(function (e) {
        e.preventDefault()
        let id = $(this).attr('data-id');

        $.get( "/layer/zones/", function(data, status) {

            $(".zone_edit_id").empty();
            for(let i =0;i < data.length;i++){
                let option = $('<option></option>').attr('value', data[i].pk).text(data[i].text.toUpperCase());
                $('.zone_edit_id').append(option);
            }

            $.get( "/layer/"+id+"/", function( data, status ) {
                $("#edit_coucche_modal input[name='name']").val(data.name)
                $("#edit_coucche_modal textarea").val(data.description)
                $("#edit_coucche_modal input[name='id_layer']").val(data.id)
                $(`.zone_edit_id option[value='${data.zone_id}']`).attr('selected','selected')
                $('#edit_coucche_modal').modal('show');
            });

        });


    })


    $("#edit_coucche_modal form").submit(function (e) {
        e.preventDefault();
        let form = $('#edit_coucche_modal form')[0]
        let data = new FormData(form)
        $.ajax({
            type: "POST",
            url: "/layer/edit/",
            data: data,
            processData: false,
            contentType: false,
            success: function (data) {
                $('#edit_coucche_modal').modal('hide');
                notify_success();
                document.location.reload()
            },
            error: function (data) {
                $('#edit_coucche_modal').modal('hide');
                notify_failed(data);
            }

        });
    })


});


