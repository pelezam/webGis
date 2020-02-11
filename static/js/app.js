$(function () {
    attributesData = null;
    layer_style_identifiant = null;

    $('#attribute_table_btn').click(function () {
        $('.table-attributaire').fadeToggle()
        setAttributeData(attributesData)
    });

    $('.table-attributaire .close_btn').click(function () {
        $('.table-attributaire').fadeToggle()
    })

    getZone();

    $('#zone_form').submit(function (e) {
        e.preventDefault();
        $.ajax({
            type: "POST",
            url: "/layer/add-zone/",
            data: {
                'name': $('#zone_name').val().toUpperCase(),
                'csrfmiddlewaretoken': $('#zone_form input[name=csrfmiddlewaretoken]').val(),
            },
            success: function (data) {
                notify_success();
                getZone();
                $('#zone_form').modal('hide')
            },
            error: function (data) {
                notify_failed(data);
                $('#zone_form').modal('hide')
            }

        });

        $('#zone_form form')[0].reset();
    });


    $('#layer_import_form').submit(function (e) {
        e.preventDefault();
        let form = $('#add_layer_form')[0]
        let data = new FormData(form)
        $.ajax({
            type: "POST",
            url: "/layer/add/",
            data: data,
            processData: false,
            contentType: false,
            enctype: "multipart/form-data",
            success: function (data) {
                $('#layer_import_form').modal('hide')
                notify_success();
                getZone();

            },
            error: function (data) {
                $('#layer_import_form').modal('hide')
                notify_failed(data);

            }

        });

        $('#add_layer_form')[0].reset();
    });


    $('.delete-couche').click(function (e) {
        e.preventDefault()
        let id = $(this).attr('data-id')
        $('#confirm-delete').find('.btn-ok').attr('href',$(this).attr('href'));
        $('#confirm-delete').modal('show');
    })


    $('#styleModal form').submit(function (e) {
        e.preventDefault()
        setLayerStyle(layer_style_identifiant)
    })


});

function notify_success() {
    $.notify({
        message: "L’opération a été effectuée avec succès."
    },{
        element: 'body',
        type: 'success',
        newest_on_top: true,
        delay:3000,
        spacing: 10,
        animate: {
            enter: 'animated fadeInDown',
            exit: 'animated fadeOutUp'
        }
    });

}

function notify_failed(data) {
    console.log(data)
    errors = JSON.parse(data.responseText)
    errors = errors.error.name[0]
    msg = errors
    $.notify({
        title: '<strong>L’opération a échouée: </strong>',
        message: msg,
    },{
        element: 'body',
        delay: 3000,
        timer: 1000,
        position: "absolute",
        type: 'danger',
        newest_on_top: true,
        spacing: 10,
        animate: {
            enter: 'animated fadeInDown',
            exit: 'animated fadeOutUp'
        }
    });

}

function getZone() {
    $.get( "layer/zones/", function(data, status) {
        treeList(data)
        setAddLayerZone(data)
    });
}

function treeList(data){
    var $checkableTree = $('#tree').treeview({
        levels:0,
        data: data,
        showIcon: true,
        showCheckbox: true,
        uncheckedIcon: "fa fa-square-o",
        checkedIcon: "fa fa-check-square-o",
        expandIcon: 'fa fa-folder',
        collapseIcon: 'fa fa-folder-open',
        onNodeChecked: function(event, node) {
            // $('#checkable-output').prepend('<p>' + node.text + ' was checked</p>');
            if(all_layers.find(element => element.layer_id === node.id )){
                myAddLayer(all_layers.find(element => element.layer_id === node.id ))
            }else{
                getLayer(node.id);
                $('#style_btn').css('visibility', 'visible')
                layer_style_identifiant = node.id
            }
        },
        onNodeUnchecked: function (event, node) {
            // $('#checkable-output').prepend('<p>' + node.text + ' was unchecked</p>');
            removeOneLayer(node.id);
        },
        onNodeSelected: function (event, node) {
            if(node.id){
                $('#attribute_table_btn').css('visibility','visible');
                if(node.id){
                    getAttributeData(node.id)
                }
            }

        },
        onNodeUnselected: function (event, node) {
            $('#attribute_table_btn').css('visibility','hidden');
            $('#style_btn').css('visibility', 'hidden');

        }
    });

}

function getLayer(id) {
    $.get( "layer/"+id+"/", function( data ) {
        // allLayers.push(data.geojson)
        if(!data.geojson.style){
            data.geojson.style = default_style
        }

        let item = L.geoJSON(data.geojson,{
                onEachFeature: onEachFeature,
            }
        );
        item.layer_id = id
        all_layers.push(item)
        myAddLayer(item);

    });
}

function myAddLayer(layer) {
    layer.setStyle(default_style);
    featureGroup.addLayer(layer);
    map.fitBounds(featureGroup.getBounds())
}

function removeOneLayer(id) {
    featureGroup.eachLayer(function (layer) {
        if(layer.layer_id === id){
            featureGroup.removeLayer(layer)
        }
    })
}

function setAddLayerZone(data) {
    $("#zone_id").empty();
    for(let i =0;i < data.length;i++){
        let option = $('<option></option>').attr('value', data[i].pk).text(data[i].text.toUpperCase());
        $('#zone_id').append(option);
    }
}

function getAttributeData(id) {
    $.get("layer/"+id+"/get_attributs/", function (data, status) {
        attributesData = data
    });
}

function setAttributeData(data) {
    $('.attribute_thead tr').empty();
    $('.attribute_tbody').empty();
    $('.attribute_layer_name em').text(data.layer.zone+"-"+data.layer.name);

    for(let i =0; i< data.attributs.length; i++){
        let th = $('<th></th>').text(data.attributs[i]);
        $('.attribute_thead tr').append(th);
    }

    for(let i =0; i< data.all_data.length; i++){
        let item = data.all_data[i]
        let tr = $('<tr></tr>')
        for(let i =0; i< data.attributs.length; i++){
            let td = $('<td></td>').text(item[data.attributs[i]]);
            tr.append(td);
        }
        $('.attribute_tbody').append(tr)
    }

}

