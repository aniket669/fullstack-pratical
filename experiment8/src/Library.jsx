import { useState } from 'react';

function Library() {
  const [books, setBooks] = useState([
    { title: "1984", author: "Mr. George" },
  ]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newBook, setNewBook] = useState({ title: "", author: "" });

  // Add book
  const handleAddBook = () => {
    if (newBook.title && newBook.author) {
      setBooks([...books, newBook]);
      setNewBook({ title: "", author: "" });
    }
  };

  // Delete book
  const handleDelete = (index) => {
    const updated = [...books];
    updated.splice(index, 1);
    setBooks(updated);
  };

  // Search filter
  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="library">
      <h2>Library Management</h2>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by title..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Add new book */}
      <div className="book-form">
        <input
          type="text"
          placeholder="Book Title"
          value={newBook.title}
          onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
        />
        <input
          type="text"
          placeholder="Author"
          value={newBook.author}
          onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
        />
        <button onClick={handleAddBook}>Add Book</button>
      </div>

      {/* Book list */}
      <ul className="book-list">
        {filteredBooks.length ? (
          filteredBooks.map((book, index) => (
            <li key={index}>
              <span>
                <b>{book.title}</b> by {book.author}
              </span>
              <button onClick={() => handleDelete(index)}>Remove</button>
            </li>
          ))
        ) : (
          <li>No books found.</li>
        )}
      </ul>
    </div>
  );
}

export default Library;
