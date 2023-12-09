import React from "react"
import Sidebar from "./components/Sidebar"
import Editor from "./components/Editor"
import Split from "react-split"
import {nanoid} from "nanoid"
import { onSnapshot , addDoc, doc, deleteDoc } from "firebase/firestore"
import { notesCollection, db } from "./firebase.js"

export default function App() {
    const [notes, setNotes] = React.useState([])
    
    const [currentNoteId, setCurrentNoteId] = React.useState(
        (notes[0]?.id) || ""
    )

    const currentNote = notes.find(note => note.id === currentNoteId) || notes[0]

    React.useEffect(() => {
        const unsubscribe = onSnapshot(notesCollection, function(snapshot) {
          // Sync up our local notes array with the snapshot data
          const notesArr = snapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id
          }))
          setNotes(notesArr)
        })
        return unsubscribe
      }, [])
    
    

    async function createNewNote() {
        const newNote = {
            body: "# Type your markdown note's title here"
        }
        const newNoteRef = await addDoc(notesCollection, newNote)
        setCurrentNoteId(newNoteRef.id)
    }

    // put the most recently modified note at the top and update the note
    function updateNote(text) {
        setNotes(oldNotes => {
          const arr = []
          for(let i = 0; i < oldNotes.length; i++) {
            if(oldNotes[i].id === currentNoteId) {
              arr.unshift({...oldNotes[i], body: text})
            } else {
              arr.push(oldNotes[i])
            }
          }
          return arr
        })
    }

    async function deleteNote(noteId) {
      const docRef = doc(db, 'notes', noteId)
      await deleteDoc(docRef)
    }
    
    return (
        <main>
        {
            notes.length > 0 
            ?
            <Split 
                sizes={[30, 70]} 
                direction="horizontal" 
                className="split"
            >
                <Sidebar
                    notes={notes}
                    currentNote={currentNote}
                    setCurrentNoteId={setCurrentNoteId}
                    newNote={createNewNote}
                    deleteNote={deleteNote}
                />
                {
                    currentNoteId && 
                    notes.length > 0 &&
                    <Editor 
                        currentNote={currentNote} 
                        updateNote={updateNote} 
                    />
                }
            </Split>
            :
            <div className="no-notes">
                <h1>You have no notes</h1>
                <button 
                    className="first-note" 
                    onClick={createNewNote}
                >
                    Create one now
                </button>
            </div>
            
        }
        </main>
    )
}
