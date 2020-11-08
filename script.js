$(document).ready(function(){
  const main_container = document.getElementById('main');

  let button = {
    /* variables */
    $el: undefined,
    /* functions */
    setElement: function(el) {
      this.$el = el;
      return this.$el;
    },
    setText: function(text) {
      this.$el.text(text);
    },
    enable: function(boolean) {
      if (boolean) this.$el.removeAttr('disabled');
      else this.$el.attr('disabled', 1);
    }
  };

  let paginator = {
    /* variables */
    currentPage: undefined,
    currentLine: undefined,
    lastLine: undefined,
    link: undefined,
    /* functions */
    showNextPage: function() {
      $('#p' + this.currentPage).removeClass('active');
      $('#p' + this.currentPage).addClass('history');
      this.createPage(this.link);
      this.showPage(this.link);
    },
    showNextLine: function() {
      this.currentLine += 1;
      var $line = $('#p' + this.currentPage + '-' + this.currentLine);
      if ($line.hasClass('choice')) {
        $line.css('display', 'flex').hide().fadeIn();
        button.enable(false);
        button.setText('Select');
      }
      else {
        button.enable(true);
        button.setText(this.currentLine == this.lastLine ? 'Next' : 'Continue');
        $line.fadeIn();
      }
    },
    isAllRead: function() {
      return (this.currentLine || 0) >= (this.lastLine || 0);
    },
    showPage: function(page) {
      this.currentPage = page;
      this.currentLine = 1;
      setTimeout(function(){
        $('#p' + page).addClass('active');
        $('#p' + page).fadeIn();
        $('#p' + page + '-1').fadeIn();
        button.enable(true);
        button.setText('Continue');
      }, 10);
    },
    createPage: function(page) {
      getSampleStory(page, function(data) {
        // Get and Set next link
        paginator.link = data.next;
        paginator.lastLine = data.sentences.length || 0;

        // Create html element
        var el = document.createElement('div');
        el.className = 'container';
        el.style.display = 'none';
        el.id = 'p' + page;

        for (var i=0; i < data.sentences.length; ++i) {
          let p = document.createElement('p');
          p.innerText = data.sentences[i];
          p.id = 'p' + page + '-' + (i+1);
          p.style.display = 'none';
          el.appendChild(p);
        }

        if (!!data.choice) {
          paginator.lastLine += 1;
          el.setAttribute('choice', true);
          var choiceBox = createChoiceBox(data.choice);
          choiceBox.id = 'p' + page + '-' + paginator.lastLine;
          el.appendChild(choiceBox);
        }

        main_container.appendChild(el);
      });
    }
  };
  
  // After load
  setTimeout(function(){
    paginator.createPage(1);
    paginator.showPage(1);
  }, 100);

  button.setElement($('#btn_action')).on('click', function(evt) {
    evt.preventDefault();
    if (paginator.isAllRead()) {
      paginator.showNextPage();
    } else {
      paginator.showNextLine();
    }
  });

  function getSampleStory(id, callback){
    $.ajax({
      url: './1.json',
      cache: false,
      dataType: 'json',
      success: function(data) {
        callback(data.stories[id]);
      }
    });
  }

  function selectChoiceEvent(evt) {
    evt.preventDefault();
    var el = evt.target;
    var next = el.getAttribute('next');
    paginator.link = next;
    button.enable(true);
    button.setText(el.innerText);
    $(el.parentNode.parentNode).find('.item').removeClass('active');
    setTimeout(function(){ el.classList.add('active'); }, 0);
  }

  function createChoiceBox(choice) {
    var row = document.createElement('div');
    row.className = 'row choice';
    for (var i=0; i < choice.length; ++i) {
      let col = document.createElement('div');
      col.className = 'col-12 col-sm-6';
      let item = document.createElement('div');
      item.className = 'item';
      item.innerText = choice[i].title;
      item.setAttribute('next', choice[i].next);
      item.addEventListener('click', selectChoiceEvent);
      col.appendChild(item);
      row.appendChild(col);
    }
    return row;
  }
});