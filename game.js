
$( "#intropage" ).live( "pagecreate", function(event) {
    $( "fieldset#keyselection" ).each( function( index, element ) {

        // add the column/key selector buttons
        for ( var keyIndex=0; keyIndex<keys.length; keyIndex++ ) {
            if ( !ignoreKeys[ keyIndex ] ) {
                var input=$( "<input>" )
                    .attr( "type", "checkbox" )
                    .attr( "checked", "checked" )
                    .attr( "id", "column_"+keyIndex );
                var label=$( "<label>" )
                    .attr( "for", "column_"+keyIndex )
                    .addClass( "custom" )
                    .html( keys[ keyIndex ] );
                $( this )
                    .append( input )
                    .append( label );

                label.bind( "vclick", function() {
                    var labelFor = $( this ).attr( "for" );
                    var checked = $("input#"+labelFor).is( ":checked" );

                    var keyIndex = labelFor.split("_")[1];

                    ignoreKeys[ keyIndex ] = checked;

                    return false;
                });
            }
        }
    });

    $( this ).find( "fieldset#lessonselection" ).each( function( index, element ) {
        // add the lesson selector buttons
        for ( var lessonIndex=0; lessonIndex<lessons.length; lessonIndex++ ) {
            var input=$( "<input>" )
                .attr( "type", "checkbox" )
                .attr( "id", "lesson_"+lessons[ lessonIndex ] );
            var label=$( "<label>" )
                .attr( "for", "lesson_"+lessons[ lessonIndex ] )
                .html( lessons[ lessonIndex ] );

            if (lessonIndex===0) {
                input.attr( "checked", "checked" );
            }

            $( this )
                .append( input )
                .append( label );

            label.bind( "vclick", function() {
                var labelFor = $( this ).attr( "for" );
                var checked = $("input#"+labelFor).is( ":checked" );

                var lessonIndex = labelFor.split("_")[1]-1;

                ignoreLessons[ lessonIndex ] = checked;

                return false;
            });
        }

    });
});

$( "#tablepage" ).live( "pageshow", function() {
    // remove previous table - in case the user uses 'back' and changes the options
    $( this ).find( "tr" ).remove();

    var noWordSelected = true;
    var currentlySelectedWord;
    var keySelected = [ null, null, null ];
    var currentSelections = []; // list of buttons selected indexed by key
    var numberCorrect = 0;

    // add table headers for each key (apart from ignoreKeys)
    $( this ).find( "thead" ).each( function( index, element ) {
        var tr=$( "<tr>" );

        for ( var keyIndex=0; keyIndex<keys.length; keyIndex++ ) {
            if ( !ignoreKeys[ keyIndex ] ) {
                var td=$( "<td>" )
                    .attr( "align", "center" )
                    .append( keys[ keyIndex ] );
                tr.append( td );
            }
        }

        $( this ).append( tr );
    });

    $( this ).find( "tbody" ).each( function( index, element ) {
        var tbody = $( element );
        var selectedWords = [];
        var indexList = [];

        var shuffle = function( listToShuffle ) {
            // fisher-yates shuffle
            for ( var wordIndex=listToShuffle.length-1; wordIndex>0; wordIndex-- ) {
                var newIndex = Math.floor( Math.random()*wordIndex );
                var oldIndex = listToShuffle[ newIndex ];
                listToShuffle[ newIndex ]  = listToShuffle[ wordIndex ];
                listToShuffle[ wordIndex ] = oldIndex;
            }
        }

        // trim the list to the selected lessons
        for ( var wordIndex=0; wordIndex<words.length; wordIndex++ ) {
            var thisLesson = words[ wordIndex ][ "lesson" ]-1;
            if ( !ignoreLessons[ thisLesson ] ) {
                selectedWords.push( words[ wordIndex ] );
            }
        }

        // shuffle the indexes
        for ( var keyIndex=0; keyIndex<keys.length; keyIndex++ ) {
            if ( !ignoreKeys[ keyIndex ] ) {
                indexList[ keyIndex ] = [];
                for ( var wordIndex=0; wordIndex<selectedWords.length; wordIndex++ ) {
                    indexList[ keyIndex ][ wordIndex ]=wordIndex;
                }
                shuffle( indexList[ keyIndex ] );
            }
        }

        for ( var wordIndex=0; wordIndex<selectedWords.length; wordIndex++ ) {
            var tr=$( "<tr>" );
            for ( var keyIndex=0; keyIndex<keys.length; keyIndex++ ) {
                if ( !ignoreKeys[ keyIndex ] ) {
                    var shuffledWordIndex = indexList[ keyIndex ][ wordIndex ];
                    var thisKey = keys[ keyIndex ];
                    var thisWord = selectedWords[ shuffledWordIndex ][ thisKey ];
                    var thisLesson = selectedWords[ shuffledWordIndex ][ "lesson" ];

                    var thisText = $( "<span>" )
                        .addClass( "ui-btn-text" )
                        .html( thisWord );

                    var thisSpan = $( "<span>" )
                        .attr( "aria-hidden", "true" )
                        .addClass( "ui-btn-inner" )
                        .addClass( "ui-btn-corner-all" )
                        .html( thisText );

                    var thisButton = $( "<a>" )
                        .attr( "href", "#" )
                        .attr( "data-role", "button" )
                        .attr( "word-index", shuffledWordIndex )
                        .attr( "key-index", keyIndex )
                        .addClass( "ui-btn" )
                        .addClass( "ui-btn-up-c" )
                        .addClass( "ui-btn-corner-all" )
                        .addClass( "ui-shadow" )
                        .html( thisSpan );

                    thisButton.bind( "vclick", function() {
                        var selectButton = function() {
                            $( this )
                                .removeClass( "ui-btn-up-c" )
                                .addClass( "ui-btn-down-c" )
                                .removeClass( "ui-btn-corner-all" );
                        };
                        var deselectButton = function() {
                            $( this )
                                .addClass( "ui-btn-up-c" )
                                .removeClass( "ui-btn-down-c" )
                                .addClass( "ui-btn-corner-all" );
                        };

                        var thisWordIndex = $( this ).attr( "word-index" );
                        var thisKeyIndex = $( this ).attr( "key-index" );
                        if ( noWordSelected ) {
                            $( this ).each( selectButton );

                            noWordSelected = false;
                            currentlySelectedWord = thisWordIndex;

                            keySelected[ thisKeyIndex ] = $( this );
                        } else {
                            var countIgnoredKeys = function() {
                                var retVal = 0;
                                for ( var keyIndex=0; keyIndex<keys.length; keyIndex++ ) {
                                    if ( ignoreKeys[ keyIndex ] ) {
                                        retVal++;
                                    }
                                }

                                return retVal;
                            }
                            var countSelectedKeys = function() {
                                var retVal = 0;
                                for ( var keyIndex=0; keyIndex<keys.length; keyIndex++ ) {
                                    if ( !ignoreKeys[ keyIndex ] && ( keySelected[ keyIndex ] != null ) ) {
                                        retVal++;
                                    }
                                }

                                return retVal;
                            }

                            if ( keySelected[ thisKeyIndex ] ) {
                                var alreadySelectedWord = keySelected[ thisKeyIndex ].attr( "word-index" );
                                var thisKeyAlreadySelected = ( alreadySelectedWord === thisWordIndex );
                                if ( thisKeyAlreadySelected ) {
                                    keySelected[ thisKeyIndex ].each( deselectButton );
                                    keySelected[ thisKeyIndex ] = null;

                                    noWordSelected = countSelectedKeys()===0;
                                } else if (countSelectedKeys() === 1) {
                                    // user changed mind
                                    // deselect all buttons for this key
                                    tbody.find( "a[key-index="+thisKeyIndex+"]" ).each( deselectButton );
                                    // select new one
                                    $( this ).each( selectButton );

                                    currentlySelectedWord = thisWordIndex;
                                    keySelected[ thisKeyIndex ] = $( this );
                                }
                            } else {
                                var thisKey = keys[ thisKeyIndex ];
                                var correct =
                                    selectedWords[ thisWordIndex ][ thisKey ]
                                    === selectedWords[ currentlySelectedWord ][ thisKey ];
                                if ( correct ) {
                                    $( this ).each( selectButton );

                                    keySelected[ thisKeyIndex ] = $( this );

                                    var allKeysSelected = function() {
                                        var retVal = countSelectedKeys() == (keys.length-countIgnoredKeys());

                                        return retVal;
                                    }

                                    if ( allKeysSelected() ) {

                                        noWordSelected = true;
                                        for ( var keyIndex=0; keyIndex<keys.length; keyIndex++ ) {
                                            if ( !ignoreKeys[ keyIndex ] ) {
                                                var buttonToRemove = keySelected[ keyIndex ];
                                                var buttonTd = buttonToRemove.closest( "td" );

                                                var nextButton = buttonTd
                                                    .closest( "tr" )
                                                    .next( "tr" )
                                                    .find( "[key-index="+keyIndex+"]" );
                                                var nextButtonWordIndex = nextButton.attr( "word-index" );

                                                buttonToRemove.remove();

                                                while ( nextButton.length ) {
                                                    var nextButtonTd = nextButton.closest( "td" );

                                                    buttonTd.append( nextButton );

                                                    nextButton = nextButtonTd
                                                        .closest( "tr" )
                                                        .next( "tr" )
                                                        .find( "[key-index="+keyIndex+"]" );
                                                    nextButtonWordIndex = nextButton.attr( "word-index" );

                                                    buttonTd = nextButtonTd;
                                                }

                                                keySelected[ keyIndex ] = null;
                                            }
                                        }

                                        tbody.find( "tr" ).last().remove();

                                        numberCorrect++;
                                        document.title = "Game "+numberCorrect+"/"+selectedWords.length;

                                        var allWordsCorrect = ( numberCorrect === selectedWords.length );
                                        if ( allWordsCorrect ) {
                                            alert( "Congratulations! You finished the game!" );
                                        }
                                    }
                                } else {
                                    // highlight in red?
                                    alert( "hint: "+selectedWords[ currentlySelectedWord ][ thisKey ] );
                                }
                            }
                        }

                        return false;
                    });

                    var columnWidth = 100.0/keys.length;

                    var thisTd = $( "<td>" )
                        .css( "width", columnWidth+"%" )
                        .attr( "align", "center" )
                        .html( thisButton );
                    tr.append( thisTd );
                }
            }

            tbody.append( tr );
        }
    });

});
