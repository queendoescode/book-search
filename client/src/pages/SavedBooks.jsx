import {
  Container,
  Card,
  Button,
  Row,
  Col
} from 'react-bootstrap';
import { useQuery, useMutation } from '@apollo/client';

import { removeBookId } from '../utils/localStorage';

import { QUERY_ME } from '../utils/queries';
import { REMOVE_BOOK } from '../utils/mutations';

const SavedBooks = () => {
  const { loading, error, data } = useQuery(QUERY_ME);
  const [ removeBook, { error: removeError, data: removeData } ] = useMutation(REMOVE_BOOK);

  // create function that accepts the book's mongo _id value as param and deletes the book from the database
  const handleDeleteBook = async (bookId) => {
    try {
      await removeBook({
        variables: { bookId },
      });

      // upon success, remove book's id from localStorage
      removeBookId(bookId);
    } catch (err) {
      console.error(err);
    }
  };

  // if data isn't here yet, say so
  if (loading) {
    return <h2>LOADING...</h2>;
  }

  return (
    <>
      {error &&
        <div className="p-5">
          <Container>
            <p>You are not logged in.</p>
          </Container>
        </div>
      }
      {!error &&
        <>
          <div className="text-light bg-dark p-5">
            <Container>
              <h1>Viewing saved books!</h1>
            </Container>
          </div>
          <Container>
            <h2 className='pt-5'>
              {data.me.savedBooks.length
                ? `Viewing ${data.me.savedBooks.length} saved ${data.me.savedBooks.length === 1 ? 'book' : 'books'}:`
                : 'You have no saved books!'}
            </h2>
            <Row>
              {data.me.savedBooks.map((book) => {
                return (
                  <Col md="4" key={book.bookId}>
                    <Card border='dark'>
                      {book.image ? <Card.Img src={book.image} alt={`The cover for ${book.title}`} variant='top' /> : null}
                      <Card.Body>
                        <Card.Title>{book.title}</Card.Title>
                        <p className='small'>Authors: {book.authors}</p>
                        <Card.Text>{book.description}</Card.Text>
                        <Button className='btn-block btn-danger' onClick={() => handleDeleteBook(book.bookId)}>
                          Delete this Book!
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </Container>
        </>
      }
    </>
  );
};

export default SavedBooks;
