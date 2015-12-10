!function(doc, win){

    function getTime(timeStamp){
        var date = new Date(+timeStamp),
            options = {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            };

        return date.toLocaleString('hu-HU', options);
    }

    function createMessage(type, e){
        if(arguments.length === 1) {
            var e = arguments[0],
                type = null;
        }

        var $list     = $('#messages'),
            time      = getTime(+e.lastEventId),
            message   = e.data,
            className = !!type ? 'alert alert-' + type : '';

        $list.append('<p class="'+className+'"><time>'+time+'</time> '+message+'</p>');
    }

    var source = new EventSource('/stream');

    source.addEventListener('message', $.proxy(createMessage, this));
    source.addEventListener('connection', $.proxy(createMessage, this, 'info'));
    source.addEventListener('disconnection', $.proxy(createMessage, this, 'danger'));

    $('#chat-form').on('submit', function(e){
        var $form  = $(this),
            $input = $('input', $form),
            data   = $form.serializeArray();

        $.ajax({
            url: '/chat',
            data: jQuery.param(data),
            method: 'post',
            success: function(e){
                $input.val('');
            }
        });

        return false;
    });

}(document, window);