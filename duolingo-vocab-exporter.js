/*
 * Duolingo Vocab Exporter
 * Created by Ruddick Lawrence
 * ===========================
 * Javascript to create CSV vocab lists from
 * Duolingo vocab pages. Assumes jQuery is
 * loaded and a certain structure for the
 * vocab page (so it will break every
 * redesign they do).
 */
(function() {

  function scrapeVocab() {
    var vocab = [];
    // Get words and translations
    var wordRows = $('table.vocabulary > tbody').children('tr');
    wordRows.each(function(index, row) {
      var $row = $(row);
      var wordInfo = null;
      // A new word
      if($row.hasClass('first-lemma-row')) {
        var canonicalWord = $row.find('td:first a').text();
        wordInfo = {
          canonical: canonicalWord,
          otherForms: [],
          translations: []
        };
        vocab.push(wordInfo);
      }
      // Another form of previous word
      else {
        wordInfo = vocab[vocab.length-1];
      }

      var lexeme = $row.children('td.lexeme');
      var form = lexeme.find('.token').text();
      if(form != wordInfo.canonical) {
        wordInfo.otherForms.push(form);
      }
      lexeme.find('tbody tr:not(.hidden) td').each(function(index, td) {
        wordInfo.translations.push($(td).text().trim());
      });
    });

    // Format vocab list
    var csv = "";
    $.each(vocab, function(index, item) {
      var words = item.canonical + (item.otherForms.length !== 0 ? ", " + item.otherForms.join(', ') : "");
      var row = '"' + words + '","' + item.translations.join(', ') + '"\n';
      csv += row;
    });

    // Display list
    var pre = $('<pre>');
    pre.text(csv);
    $('body').children().remove();
    $('body').append(pre);
  }

  function scrollDown() {
    // Indicates all words are loaded
    if($('#vocab-spinner').length === 0) {
      // Give a little time for last vocab to load
      // Should really just check if it's there, but whatever...
      setTimeout(scrapeVocab, 1000);
    }
    else {
      $(document).scrollTop($(document).height());
      setTimeout(scrollDown, 100);
    }
  }

  scrollDown();
})();