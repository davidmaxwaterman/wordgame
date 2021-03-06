var wordData;

// modify page before jqm gets to it
$( "#intropage" ).live( "pagebeforecreate", function( event ) {
    var $page = $(this);

    $.getJSON( "wordlist.json", function( data ) {
        wordData = data;

        $page.find( "fieldset#keyselection" ).each( function( index, element ) {

            // add the column/key selector buttons
            for ( var keyIndex=0; keyIndex<wordData.keys.length; keyIndex++ ) {
                if ( !wordData.ignoreKeys[ keyIndex ] ) {
                    var input=$( "<input>" )
                        .attr( "type", "checkbox" )
                        .attr( "checked", "checked" )
                        .attr( "id", "column_"+keyIndex );
                    var label=$( "<label>" )
                        .attr( "for", "column_"+keyIndex )
                        .addClass( "custom" )
                        .html( wordData.keys[ keyIndex ] );
                    $( this )
                        .append( input )
                        .append( label );

                    label.bind( "vclick", function() {
                        var labelFor = $( this ).attr( "for" );
                        var checked = $( "input#"+labelFor ).is( ":checked" );

                        var keyIndex = labelFor.split( "_" )[1];

                        wordData.ignoreKeys[ keyIndex ] = checked;

                        return false;
                    });
                }
            }
        });

        $page.find( "fieldset#lessonselection" ).each( function( index, element ) {
            // add the lesson selector buttons
            for ( var lessonIndex=0; lessonIndex<wordData.lessons.length; lessonIndex++ ) {
                var lesson = wordData.lessons[ lessonIndex ];
                var input=$( "<input>" )
                    .attr( "type", "checkbox" )
                    .attr( "id", "lesson_"+lesson );
                var label=$( "<label>" )
                    .attr( "for", "lesson_"+lesson )
                    .html( lesson );

                if ( !wordData.ignoreLessons[ lesson ] ) {
                    input.attr( "checked", "checked" );
                }

                $( this )
                    .append( input )
                    .append( label );

                label.bind( "vclick", function() {
                    var labelFor = $( this ).attr( "for" );
                    var checked = $( "input#"+labelFor ).is( ":checked" );

                    var lessonIndex = labelFor.split( "_" )[1];

                    wordData.ignoreLessons[ lessonIndex ] = checked;

                    return false;
                });
            }

        });

        $page.trigger( "pagecreate" );
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

    // add table headers for each key (apart from wordData.ignoreKeys)
    $( this ).find( "thead" ).each( function( index, element ) {
        var tr=$( "<tr>" );

        for ( var keyIndex=0; keyIndex<wordData.keys.length; keyIndex++ ) {
            if ( !wordData.ignoreKeys[ keyIndex ] ) {
                var td=$( "<td>" )
                    .attr( "align", "center" )
                    .append( wordData.keys[ keyIndex ] );
                tr.append( td );
            }
        }

        $( this ).append( tr );
    });

    $( this ).find( "tbody" ).each( function( index, element ) {
        var tbody = $( element );
        var shuffledWords = [];
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
        for ( var wordIndex=0; wordIndex<wordData.words.length; wordIndex++ ) {
            var thisLesson = wordData.words[ wordIndex ][ "lesson" ];
            if ( !wordData.ignoreLessons[ thisLesson ] ) {
                shuffledWords.push( wordData.words[ wordIndex ] );
            }
        }

        // shuffle the indices
        for ( var keyIndex=0; keyIndex<wordData.keys.length; keyIndex++ ) {
            if ( !wordData.ignoreKeys[ keyIndex ] ) {
                indexList[ keyIndex ] = [];
                for ( var wordIndex=0; wordIndex<shuffledWords.length; wordIndex++ ) {
                    indexList[ keyIndex ][ wordIndex ]=wordIndex;
                }
                shuffle( indexList[ keyIndex ] );
            }
        }

        for ( var wordIndex=0; wordIndex<shuffledWords.length; wordIndex++ ) {

            var countIgnoredKeys = function() {
                var retVal = 0;
                for ( var keyIndex=0; keyIndex<wordData.keys.length; keyIndex++ ) {
                    if ( wordData.ignoreKeys[ keyIndex ] ) {
                        retVal++;
                    }
                }

                return retVal;
            }

            var tr=$( "<tr>" );
            for ( var keyIndex=0; keyIndex<wordData.keys.length; keyIndex++ ) {
                if ( !wordData.ignoreKeys[ keyIndex ] ) {
                    var shuffledWordIndex = indexList[ keyIndex ][ wordIndex ];
                    var thisKey = wordData.keys[ keyIndex ];
                    var thisWord = shuffledWords[ shuffledWordIndex ][ thisKey ];
                    var thisLesson = shuffledWords[ shuffledWordIndex ][ "lesson" ];

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

                            var countSelectedKeys = function() {
                                var retVal = 0;
                                for ( var keyIndex=0; keyIndex<wordData.keys.length; keyIndex++ ) {
                                    if ( !wordData.ignoreKeys[ keyIndex ] && ( keySelected[ keyIndex ] != null ) ) {
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
                                } else if ( countSelectedKeys() === 1 ) {
                                    // user changed mind
                                    // deselect all buttons for this key
                                    tbody.find( "a[key-index="+thisKeyIndex+"]" ).each( deselectButton );
                                    // select new one
                                    $( this ).each( selectButton );

                                    currentlySelectedWord = thisWordIndex;
                                    keySelected[ thisKeyIndex ] = $( this );
                                }
                            } else {
                                var thisKey = wordData.keys[ thisKeyIndex ];
                                var checkCombinations = function( thisKeyIndex, thisWordIndex, keySelected ) {
                                    var retVal = false;

                                    // make array with key and word indices
                                    var selectedWords = [];
                                    selectedWords[ thisKeyIndex ] = thisWordIndex;
                                    for ( var keySelectedIndex=0; keySelectedIndex<keySelected.length; keySelectedIndex++ ) {
                                        if ( keySelected[ keySelectedIndex ] != null ) {
                                            var wordIndex = keySelected[ keySelectedIndex ].attr( "word-index" )
                                            selectedWords[ keySelectedIndex ] = wordIndex;
                                        }
                                    }

                                    // for each key
                                    for ( var keyIndex=0; keyIndex<wordData.keys.length; keyIndex++ ) {
                                        if ( wordData.ignoreKeys[ keyIndex ] || !selectedWords[ keyIndex ] ) continue;

                                        var thisWordIndex = selectedWords[ keyIndex ];

                                        var valid = true;
                                        // for each other key
                                        for ( var otherKeyIndex=0; otherKeyIndex<wordData.keys.length; otherKeyIndex++ ) {
                                            if ( wordData.ignoreKeys[ otherKeyIndex ] || ( otherKeyIndex == keyIndex ) || !selectedWords[ otherKeyIndex ] ) continue;

                                            var otherWordIndex = selectedWords[ otherKeyIndex ];

                                            // these match if the values of the keys are the same for both this word and other word
                                            var otherKey = wordData.keys[ otherKeyIndex ];
                                            var thisWordString = shuffledWords[ thisWordIndex ][ otherKey ];
                                            var otherWordString = shuffledWords[ otherWordIndex ][ otherKey ];
                                            var theseMatch = ( thisWordString == otherWordString );
                                            if ( !theseMatch ) { // all have to match, so break as soon as one doesn't
                                                valid = false;
                                                break;
                                            }
                                        }

                                        if ( valid ) {
                                            retVal = true;
                                            break;
                                        }
                                    }

                                    return retVal;
                                };
                                var correct = checkCombinations( thisKeyIndex, thisWordIndex, keySelected );
                                if ( correct ) {
                                    $( this ).each( selectButton );

                                    keySelected[ thisKeyIndex ] = $( this );

                                    var allKeysSelected = function() {
                                        var retVal = countSelectedKeys() == ( wordData.keys.length-countIgnoredKeys() );

                                        return retVal;
                                    }

                                    if ( allKeysSelected() ) {
                                        noWordSelected = true;

                                        // user correctly selected each key, so turn selected buttons greem...
                                        for ( var keyIndex=0; keyIndex<wordData.keys.length; keyIndex++ ) {
                                            if ( !wordData.ignoreKeys[ keyIndex ] ) {
                                                var buttonToRemove = keySelected[ keyIndex ];
                                                buttonToRemove
                                                    .find( ".ui-btn-inner" ).css( "background-color", "green" );
                                            }
                                        }

                                        // ...and remove the buttons and tds
                                        var intervalId = setInterval( function() {
                                            clearInterval( intervalId );
                                            for ( var keyIndex=0; keyIndex<wordData.keys.length; keyIndex++ ) {
                                                if ( !wordData.ignoreKeys[ keyIndex ] ) {
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
                                        }, 1000 );

                                        // on n950, it seems to be quite easy to select a button accidentally
                                        // so here we deselect them all for the same key
                                        tbody.find( "a[key-index="+thisKeyIndex+"]" ).each( deselectButton );

                                        numberCorrect++;
                                        document.title = "Game "+numberCorrect+"/"+shuffledWords.length;

                                        var allWordsCorrect = ( numberCorrect === shuffledWords.length );
                                        if ( allWordsCorrect ) {
                                            var p = $( "#popupList" ).find( "p" );
                                            p.text( "You completed that game! Now press 'back' and try again." );
                                            $( "#popupList" ).popupwindow( "open" );
                                        }
                                    }
                                } else {
                                    var hintString = function( thisKeyIndex, keySelected ) {
                                        var retVal = "no hint found";

                                        // for each of the selected keys
                                        //   allTextTheSame = true;
                                        //   for each of the other selected keys
                                        //     allTextTheSame &= thisTextTheSame   
                                        //   if allTextTheSame, then this is the hint
                                        for ( var keyIndex=0; keyIndex<wordData.keys.length; keyIndex++ ) {
                                            if ( wordData.ignoreKeys[ keyIndex ] || !keySelected[ keyIndex ] ) continue;

                                            var wordIndex = keySelected[ keyIndex ].attr( "word-index" )

                                            var allTextTheSame = true;
                                            for ( var otherKeyIndex=0; otherKeyIndex<wordData.keys.length; otherKeyIndex++ ) {
                                                if ( wordData.ignoreKeys[ otherKeyIndex ] || !keySelected[ otherKeyIndex ] || otherKeyIndex==keyIndex ) continue;

                                                var otherKeyString = wordData.keys[ otherKeyIndex ];
                                                var otherWordIndex = keySelected[ otherKeyIndex ].attr( "word-index" )
                                                var otherWord = shuffledWords[ otherWordIndex ][ otherKeyString ];
                                                var wordForThisKey = shuffledWords[ wordIndex ][ otherKeyString ];

                                                if ( otherWord != wordForThisKey ) {
                                                    allTextTheSame = false;
                                                    break;
                                                }
                                            }

                                            if ( allTextTheSame ) {
                                                var thisKeyString = wordData.keys[ thisKeyIndex ];
                                                retVal = shuffledWords[ wordIndex ][ thisKeyString ];
                                                break;
                                            }
                                        }

                                        return retVal;
                                    };
                                    var p = $( "#popupList" ).find( "p" );
                                    p.text( "hint: "+hintString( thisKeyIndex, keySelected ) );
                                    $( "#popupList" ).popupwindow( "open" );
                                }
                            }
                        }

                        return false;
                    });

                    var columnWidth = 100.0/( wordData.keys.length-countIgnoredKeys());

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

