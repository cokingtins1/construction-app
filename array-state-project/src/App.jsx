import { useState } from "react"

const INITIAL_VALUE = ["A", "B", "C"]

function App() {
	const [array, setArray] = useState(INITIAL_VALUE)
	const [value, setValue] = useState("")

	function removeFirstElement() {
		setArray((currentArray) => {
			return currentArray.slice(1)
		})
	}

	function removeSpecificLetter(letter) {
		setArray((currentArray) => {
			// .filter only keeps the elements where its () evaluates to true
			return currentArray.filter((element) => element !== letter)
		})
	}

	function addLettertoStart(letter) {
		setArray((currentArray) => {
			return [letter, ...currentArray]
		})
	}

	function addLettertoEnd(letter) {
		setArray((currentArray) => {
			return [...currentArray, letter]
		})
	}

	function clear() {
		setArray([])
	}

	function reset() {
		setArray(INITIAL_VALUE)
	}

	function updateAtoH() {
		setArray((currentArray) => {
			return currentArray.map((element) =>
				element === "A" ? "H" : element
			)
		})
	}

	function addLetterAtIndex(letter, index) {
		setArray((currentArray) => {
			return [
				...currentArray.slice(0, index),
				letter,
				...currentArray.slice(index),
			]
		})
	}

	return (
		<div>
			<button onClick={removeFirstElement}>Remove First Element</button>
			<br />
			<button onClick={() => removeSpecificLetter("B")}>
				Remove All B's
			</button>
			<br />
			<button onClick={() => addLettertoStart("B")}>Add to Start</button>
			<br />
			<button onClick={() => addLettertoEnd("Z")}>Add to End</button>
			<br />
			<button onClick={clear}>Clear</button>
			<br />
			<button onClick={reset}>Reset</button>
			<br />
			<button onClick={updateAtoH}>Update A to H</button>
			<br />
			<button
				onClick={() => {
					addLetterAtIndex("C", 2)
				}}
			>
				Add C at 2
			</button>
			<br />
			<input value={value} onChange={(e) => setValue(e.target.value)} />
			<br />
			<button
				onClick={() => {
					addLettertoStart(value)
				}}
			>
				Add Value to Array
			</button>
			{array.join(",")}
		</div>
	)
}

export default App
