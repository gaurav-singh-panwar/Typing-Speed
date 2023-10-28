import React, { createRef, useEffect, useRef, useState, useMemo } from 'react'
import { generate } from "random-words";
import { useTestMode } from '../Context/TestModeContext';
import UpperMenu from './UpperMenu';
import Stats from './Stats';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useNavigate } from 'react-router-dom';


const TypingBox = () => {

    const inputRef = useRef(null)
    const { testTime } = useTestMode()
    const [intervalId, setIntervalId] = useState(null)
    const [countDown, setCountDown] = useState(testTime)
    const [testStart, setTestStart] = useState(false)
    const [testEnd, setTestEnd] = useState(false)
    const [correctChars, setCorrectChars] = useState(0)
    const [incorrectChars, setIncorrectChars] = useState(0)
    const [missedChars, setMissedChars] = useState(0) //if some times charcters miss when click space.
    const [extraChars, setExtraChars] = useState(0)
    const [correctWords, setCorrectWords] = useState(0)

    const navigate = useNavigate();

    const [wordsArray, setWordsArray] = useState(() => {
        return generate(50);
    })



    const [graphData, setGraphData] = useState([])

    const [currentWordIndex, setCurrentWordIndex] = useState(0)
    const [currentCharIndex, setCurrentCharIndex] = useState(0)

    const handleWords = (count) => {
        setWordsArray((() => {
            return generate(count);
        }))
    }
    const startTimer = () => {
        const interval = setInterval(timer, 1000);
        setIntervalId(interval)
        function timer() {
            setCountDown((latestCountDown) => {
                setCorrectChars((correctChars) => {
                    //graph data
                    setGraphData((graphData) => {
                        return [...graphData, [
                            testTime - latestCountDown + 1,
                            (correctChars / 5) / (testTime - latestCountDown + 1) / 60
                        ]]
                    })
                    return correctChars
                })
                if (latestCountDown === 1) {
                    setTestEnd(true);
                    clearInterval(interval)
                    return 0;
                }
                return latestCountDown - 1
            })
        }

    }


    const wordsSpanRef = useMemo(() => {
        return Array(wordsArray.length).fill(0).map(i => createRef(null))
    }, [wordsArray])

    const resetTest = () => {
        clearInterval(intervalId)
        setCountDown(testTime);
        setTestStart(false)
        setTestEnd(false)
        setCurrentWordIndex(0);
        setCurrentCharIndex(0);
        resetWordSpanRefClassName();
        setWordsArray(generate(50))
        focusInput()
    }

    const resetWordSpanRefClassName = () => {
        wordsSpanRef.map((i) => (
            Array.from(i.current.childNodes).map((j) => {
                return j.className = "";
            })
        ))
        wordsSpanRef[0].current.childNodes[0].className = 'current'
    }

    const calculateWPM = () => {
        //check
        return Math.round((correctChars / 5) / (testTime / 60));
    }
    const calcualteAccuracy = () => {
        return Math.round((correctWords / currentWordIndex) * 100)
    }




    const handleUserInput = (e) => {
        if (!testStart) {
            startTimer()
            setTestStart(true)
        }

        const currentWordRef = wordsSpanRef[currentWordIndex].current;
        const allCurrentChars = wordsSpanRef[currentWordIndex].current.childNodes

        if (currentWordRef) {
            //logic for space
            if (e.keyCode === 32) {

                let correctCharsInWord = wordsSpanRef[currentWordIndex].current.querySelectorAll('.correct')

                if (correctCharsInWord.length === allCurrentChars.length) {
                    setCorrectWords(correctWords + 1) 
                }

                if (allCurrentChars.length <= currentCharIndex) {
                    allCurrentChars[currentCharIndex - 1].classList.remove('current-right')
                } else {
                    setMissedChars(missedChars + (allCurrentChars.length - currentCharIndex)) 
                    allCurrentChars[currentCharIndex].classList.remove('current')
                }

                wordsSpanRef[currentWordIndex + 1].current.childNodes[0].className = 'current';
                setCurrentCharIndex(0) 
                setCurrentWordIndex(currentWordIndex + 1)  
                return;
            }
        }

        if (e.keyCode === 8) {
            if (currentCharIndex !== 0) {

                if (allCurrentChars.length === currentCharIndex) {

                    //removing wrong lettters
                    if (allCurrentChars[currentCharIndex - 1].className.includes('extra')) {
                        allCurrentChars[currentCharIndex - 1].remove();
                        allCurrentChars[currentCharIndex - 2].className += ' current-right'//cursor moving back
                    } else {
                        allCurrentChars[currentCharIndex - 1].className = 'current'
                    }

                    setCurrentCharIndex(currentCharIndex - 1)
                    return;
                }

                allCurrentChars[currentCharIndex].className = ''
                allCurrentChars[currentCharIndex - 1].className = 'current'
                setCurrentCharIndex(currentCharIndex - 1)
            }

            return;
        }

        if (currentCharIndex === allCurrentChars.length) {
            let Span = document.createElement('span')
            Span.innerText = e.key;
            Span.className = 'incorrect extra current-right';
            wordsSpanRef[currentWordIndex].current.append(Span);
            setCurrentCharIndex(currentCharIndex + 1);

            allCurrentChars[currentCharIndex - 1].classList.remove('current-right')
            setExtraChars(extraChars + 1) //counting extra chars for WPM
            return;
        }

        // Compare the typed character with the expected character
        if (e.key === allCurrentChars[currentCharIndex].innerText) {
            allCurrentChars[currentCharIndex].className = "correct"; // Mark character as correct
            setCorrectChars(correctChars + 1) //counting correct chars or accuracy
        } else {
            allCurrentChars[currentCharIndex].className = "incorrect"; // Mark character as incorrect
            setIncorrectChars(incorrectChars + 1)
        }

        //cursor move left to right
        if (currentCharIndex + 1 === allCurrentChars.length) {
            allCurrentChars[currentCharIndex].className += ' current-right' // Mark the next character as current
        }
        else {
            allCurrentChars[currentCharIndex + 1].className = 'current' // Mark the next character as current
        }

        setCurrentCharIndex(currentCharIndex + 1) // Move to the next character
    }



    const focusInput = () => {
        inputRef.current.focus()
    }


    useEffect(() => {
        setCountDown(testTime)
    }, [testTime])

    useEffect(() => {
        resetTest()
    }, [testTime])

    useEffect(() => {
        focusInput()
        wordsSpanRef[0].current.childNodes[0].className = 'current'; //cursor visible at first letter of word at mount
    }, [])

    useEffect(() => {
        const handleDoubleClicks = (e) => {
            console.log(e)

            if (e.keyCode === 27) {
                resetTest()
            } else if (e.keyCode === 18) {

            }

        };


        window.addEventListener('keydown', handleDoubleClicks);

        return () => {
            window.removeEventListener('keydown', handleDoubleClicks);
        };
    });

    return (
        <div>
            {!testEnd && <UpperMenu countDown={countDown} />}
            <div className='type-box' onClick={focusInput}>
                {
                    testEnd ? <div><Stats  wpm={calculateWPM()} accuracy={calcualteAccuracy()} correctChars={correctChars} incorrectChars={incorrectChars} missedChars={missedChars} extraChars={extraChars} graphData={graphData} /><button onClick={()=>setTestEnd(false)}  type="button">Try Again</button></div> :
                        (<code className='words'>
                            {
                                wordsArray.map((word, index) => (
                                    <span className='word' ref={wordsSpanRef[index]}>
                                        {
                                            word.split('').map((char) => (
                                                <span>{char}</span>
                                            ))
                                        }
                                    </span>
                                ))
                            }
                        </code>)
                }
                <input
                    type="text"
                    className='hidden-input'
                    onKeyDown={handleUserInput}
                    //the reference of the input element will be present inside the inputref
                    ref={inputRef}
                />
                {!testEnd &&
                    <center className='btn-container'>
                        <div className='refresh'>
                            <RefreshIcon  onClick={resetTest} />
                        </div>
                        <div>
                            <button className='bottom-btn'>esc</button>
                            <span className='bottom-span'>-</span>
                            <span className='bottom-span'>reset</span>
                        </div>
                        <button className='bottom-btn' onClick={() => handleWords(10)}>10</button>
                        {/* <button className='bottom-btn' onClick={()=>handleWords(25)}>25</button> */}
                        <button className='bottom-btn' onClick={() => handleWords(50)}>50</button>
                        <button className='bottom-btn' onClick={() => handleWords(80)}>80</button>
                        <button className='bottom-btn' onClick={() => handleWords(100)}>100</button>
                        <span className='bottom-span'>-</span>
                        <span className='bottom-span'>no. of words</span>
                    </center>
                }
            </div>
        </div>
    )
}

export default TypingBox
