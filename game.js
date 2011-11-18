$( document ).bind( "pagecreate", function() {
    $( "#tablepage" ).bind( "pageshow", function() {
        var noWordSelected = true;
        var currentlySelectedWord;
        var keySelected = [ false, false, false ];
        var currentSelections = []; // list of buttons selected indexed by key
        var numberCorrect = 0;

        $( this ).find( "thead" ).each( function( index, element ) {
            var tr=$("<tr>");

            for ( var keyIndex=0; keyIndex<keys.length; keyIndex++ ) {
                if (!ignoreKeys[keyIndex]) {
                    var td=$("<td>")
                        .attr("align","center")
                        .append(keys[keyIndex]);
                    tr.append(td);
                }
            }

            $(this).append(tr);
        });

        $( this ).find( "tbody" ).each( function( index, element ) {
            var tbody = $(element);
            var indexList = [];

            var shuffle = function( listToShuffle ) {
                // fisher-yates shuffle
                for ( var wordIndex=words.length-1; wordIndex>0; wordIndex-- ) {
                    var newIndex = Math.floor(Math.random()*wordIndex);
                    var oldIndex = listToShuffle[newIndex];
                    listToShuffle[newIndex]  = listToShuffle[wordIndex];
                    listToShuffle[wordIndex] = oldIndex;
                }
            }

            for ( var keyIndex=0; keyIndex<keys.length; keyIndex++ ) {
                if (!ignoreKeys[keyIndex]) {
                    indexList[keyIndex] = [];
                    for ( var wordIndex=0; wordIndex<words.length; wordIndex++ ) {
                        indexList[keyIndex][wordIndex]=wordIndex;
                    }
                    shuffle( indexList[keyIndex] );
                }
            }

            for ( var wordIndex=0; wordIndex<words.length; wordIndex++ ) {
                var tr=$( "<tr>" );
                for ( var keyIndex=0; keyIndex<keys.length; keyIndex++ ) {
                    if (!ignoreKeys[keyIndex]) {
                        var shuffledWordIndex = indexList[ keyIndex ][ wordIndex ];
                        var thisKey = keys[ keyIndex ];
                        var thisWord = words[ shuffledWordIndex ][ thisKey ];

                        var thisText = $( "<span>" )
                            .addClass( "ui-btn-text" )
                            .html( thisWord );

                        var thisSpan = $( "<span>" )
                            .attr( "aria-hidden", "true" )
                            .addClass( "ui-btn-inner" )
                            .addClass( "ui-btn-corner-all" )
                            .html( thisText );

                        var thisButton = $( "<a>" )
                            .attr( "href","#" )
                            .attr( "data-role","button" )
                            .attr( "word-index", shuffledWordIndex )
                            .attr( "key-index", keyIndex )
                            .addClass( "ui-btn" )
                            .addClass( "ui-btn-up-c" )
                            .addClass( "ui-btn-corner-all" )
                            .addClass( "ui-shadow" )
                            .html( thisSpan );

                        thisButton.click( function() {
                            var selectButton = function() {
                                console.log( "selectButton/"+$(this).attr("key-index")+"/"+$(this).attr("word-index") );
                                $(this)
                            .removeClass( "ui-btn-up-c" )
                            .addClass( "ui-btn-down-c" )
                            .removeClass("ui-btn-corner-all");
                            };
                            var deselectButton = function() {
                                $(this)
                            .addClass( "ui-btn-up-c" )
                            .removeClass( "ui-btn-down-c" )
                            .addClass("ui-btn-corner-all");
                            };

                            var thisWordIndex = $(this).attr("word-index");
                            var thisKeyIndex = $(this).attr("key-index");
                            if (noWordSelected) {
                                $(this).each( selectButton );

                                noWordSelected = false;
                                currentlySelectedWord = thisWordIndex;

                                keySelected[ thisKeyIndex ] = $(this);

                                // highlight in green
                                console.log( "green/"+thisWordIndex+"/"+thisKeyIndex+"/" );
                            } else {
                                if ( keySelected[ thisKeyIndex ] ) {
                                    // user changed mind
                                    // deselect all buttons for this key
                                    tbody.find("a[key-index="+thisKeyIndex+"]").each( deselectButton );
                                    // select new one
                                    $(this).each( selectButton );

                                    currentlySelectedWord = thisWordIndex;
                                    keySelected[ thisKeyIndex ] = $(this);

                                    // highlight in green
                                    console.log( "amber/"+thisWordIndex+"/"+thisKeyIndex+"/" );
                                } else {
                                    var thisKey = keys[ thisKeyIndex ];
                                    console.log( "1/"+thisWordIndex+"/"+currentlySelectedWord+"/" );
                                    console.log( "1/"+words[thisWordIndex][thisKey]+"/"+words[currentlySelectedWord][thisKey]+"/" );
                                    var correct = words[thisWordIndex][thisKey] === words[currentlySelectedWord][thisKey];
                                    if ( correct ) {
                                        $(this).each( selectButton );

                                        keySelected[ thisKeyIndex ] = $(this);

                                        // highlight in green
                                        console.log( "correct/"+thisWordIndex+"/"+currentlySelectedWord+"/" );

                                        var allKeysSelected = function() {
                                            var retVal = true;

                                            for ( var keyIndex=0; keyIndex<keys.length; keyIndex++ ) {
                                                if (!ignoreKeys[keyIndex]) {
                                                    retVal &= (keySelected[ keyIndex ]!=null);
                                                }
                                            }

                                            return retVal;
                                        }

                                        if ( allKeysSelected() ) {
                                            console.log("all correct");

                                            noWordSelected = true;
                                            for ( var keyIndex=0; keyIndex<keys.length; keyIndex++ ) {
                                                if (!ignoreKeys[keyIndex]) {
                                                    var buttonToRemove = keySelected[ keyIndex ];
                                                    var buttonTd = buttonToRemove.closest("td");

                                                    var nextButton = buttonTd // <td>
                                                        .closest("tr") // <tr>
                                                        .next("tr") // next <tr>
                                                        .find("[key-index="+keyIndex+"]"); // next <a> with the correct key-index
                                                    var nextButtonWordIndex = nextButton.attr("word-index");

                                                    buttonToRemove.remove();

                                                    while (nextButton.length) {
                                                        var nextButtonTd = nextButton.closest("td");

                                                        // move next button up into td
                                                        buttonTd.append( nextButton );

                                                        // find next button
                                                        nextButton = nextButtonTd
                                                            .closest("tr") // <tr>
                                                            .next("tr") // next <tr>
                                                            .find("[key-index="+keyIndex+"]"); // next <a> with the correct key-index
                                                        nextButtonWordIndex = nextButton.attr("word-index");

                                                        // move td to next button's td
                                                        buttonTd = nextButtonTd;
                                                    }

                                                    keySelected[ keyIndex ] = null;
                                                }
                                            }

                                            // remove last tr
                                            tbody.find("tr").last().remove();

                                            numberCorrect++;
                                            document.title = "Game "+numberCorrect+"/"+words.length;
                                        }
                                    } else {
                                        // highlight in red?
                                        alert( "hint: "+words[currentlySelectedWord][thisKey] );
                                    }
                                }
                            }
                        });

                        var columnWidth = 100.0/keys.length;

                        var thisTd = $( "<td>" );
                        thisTd.css( "width", columnWidth+"%" );
                        thisTd.attr( "align", "center" );
                        thisTd.html( thisButton );
                        tr.append( thisTd );
                    }
                }

                tbody.append( tr );
            }
        });

    });
});
