/*
The MIT License (MIT)

Copyright (c) 2018 Swaroop Hegde

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
var count = 0;
var md;
$(document).ready(function() {
    md = window.markdownit({linkify: true, typographer: true});
    var query = location.search.substr(1).split('=');
    switch (query[0]){
        case 'post':
            $.getJSON(prefix+'/getPost/'+query[1], function(d){
                if (d.success){
                    d = d.data[0];
                    var date = new Date(d.time*1000);
                    d.title = $('<html>'+d.title+'</html>').text();
                    $("#postTitle").text(d.title);
                    $("#postContent").html(md.render(d.body));
                    $("#postDate").text('Posted on '+monthNames[date.getMonth()]+' '+date.getDate()+', '+date.getFullYear());
                    if (d.isDead){
                        $(".post-heading").css('text-decoration', 'line-through');
                        $("article").css('text-decoration', 'line-through');
                    }
                    if (d.photo){
                        $("header").css('background-image', "url('"+d.photo+"')");
                    }
                } else {
                    console.log(d);
                }
            });
            $(".masthead.post").show();
            $("article").show();
        break;
        case 'from':
        default:
            if (query[1]){
                fetchPosts(query[1]);
            } else {
                $.getJSON(prefix+'/lastPostId', function(d){
                    if (d.success){
                        d = d.data[0].uint256;
                        fetchPosts(d);
                    }
                });
            }
            $(".masthead.home").show();
            $(".container.home").show();
        break;
    }
    $.getJSON(prefix+'/blogTitle', function(d){
        if (d.success){
            d = d.data[0].string;
            $('title').text(d);
            $('.navbar-brand').text(d);
            $('.site-heading h1').text(d);
            $('meta[name=description]').attr('content', d);
        }
    })
    $.getJSON(prefix+'/ownerName', function(d){
        if (d.success){
            d = d.data[0].string;
            $('.subheading').text('A microblog by '+d);
            $('.copyright span').text(d);
            $('meta[name=author]').attr('content', d);
        }
    })
    $("#contractLink").attr('href', 'https://kovan.etherscan.io/address/'+contract);
    if (twitter){
        $("#twitter").attr('href', 'https://twitter.com/'+twitter).parent().show();
    }
    if (facebook){
        $("#facebook").attr('href', 'https://facebook.com/'+facebook).parent().show();
    }
    if (github){
        $("#github").attr('href', 'https://github.com/'+github).parent().show();
    }
});

function fetchPosts(i){
    if (i <= 0) {
        return;
    }
    if (count > 0){
        $("#posts").append('<hr>');
    }
    if (count == maxPosts){
        $("#posts").append('<div class="clearfix">\
          <a class="btn btn-primary float-right" href="?from='+i+'">Older Posts &rarr;</a>\
      </div>');
        return;
    }
    count++
    $.getJSON(prefix+'/getPost/'+i, function(d){
        if (d.success){
            d = d.data[0];
            var date = new Date(d.time*1000);
            d.title = $('<html>'+d.title+'</html>').text();
            d.body = $('<html>'+d.body+'</html>').text();
            d.body = $(md.render(d.body)).text();
            var deadStyle = d.isDead ? 'text-decoration:line-through': '';
            $("#posts").append('<div class="post-preview" style="'+deadStyle+'">\
              <a href="?post='+i+'">\
                <h2 class="post-title">'+d.title+'</h2>\
                <h3 class="post-subtitle">'+(d.body.length > 140 ? d.body.substr(0, 140)+'...' : d.body)+'</h3>\
            </a>\
              <p class="post-meta">Posted on '+monthNames[date.getMonth()]+' '+date.getDate()+', '+date.getFullYear()+'</p>\
          </div>');
            fetchPosts(i-1);
        } else {
            console.log(d);
        }
    });
}
