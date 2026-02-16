import { styles } from './App.styles'

function View() {
  const handleSubmit = () => {
    // TODO: Implement submit behavior.
  }

  return (
    <div style={styles.page}>
      <form
        style={styles.form}
        onSubmit={(event) => {
          event.preventDefault()
          handleSubmit()
        }}
      >
        <h1 style={styles.title}>What's the name of this color?</h1>
        <input type="text" style={styles.input} />
        <button type="submit" style={styles.button}>
          Submit
        </button>
      </form>
    </div>
  )
}

function App() {
  return <View />
}

export default App
