import { Button, IconButton, Modal, Divider } from "@material-ui/core";
import AppBar from "@material-ui/core/AppBar";
import Chip from "@material-ui/core/Chip";
import Fab from "@material-ui/core/Fab";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Paper from "@material-ui/core/Paper";
import Select from "@material-ui/core/Select";
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import AddIcon from "@material-ui/icons/Add";
import CloseIcon from "@material-ui/icons/Close";
import DeleteIcon from "@material-ui/icons/Delete";
import electron from "electron";
import Head from "next/head";
import React, { useEffect, useState } from "react";
import { Link } from "../components";

// a opção de clicar em uma pergunta quando
// eu quiser ler ela ou editá-la.
// Editar pode ser mais complicado,
// mas escolher uma pergunta é uma boa
// pq algumas vezes tem umas que eu faço questão de
// ler num programa e
// (2) uma opção para marcar uma pergunta como "respondida"
// para que ela não volte ao sorteio em programas futuros
// Por fim pensei numa outra coisa que seria mais charme do que
// realmente algo que usaria com frequência: um filtro por data.
// Para eu pedir um sorteio só de perguntas da última semana ou só do
// último mês, por exemplo.

// prevent SSR webpacking
const ipcRenderer = electron.ipcRenderer || false;

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  title: {
    flexGrow: 1,
    textAlign: "center",
    color: "white",
  },
  container: {
    padding: 30,
  },
  table: {
    minWidth: 650,
  },
  fab: {
    position: "absolute",
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  },
  icon: {
    color: "white",
  },
}));

const Home = () => {
  const classes = useStyles({});
  const [messages, setMessages] = useState<any[]>([]);

  const reloadMessages = () => {
    if (ipcRenderer) {
      setMessages(ipcRenderer.sendSync("get-messages"));
    }
  }

  const unreadMessages = messages
    .filter(message => !message.read);

  useEffect(() => {
    // componentDidMount()
    if (ipcRenderer) {
      setMessages(ipcRenderer.sendSync("get-messages"));
    }

    return () => {
      // componentWillUnmount()
    };
  }, []);

  return (
    <React.Fragment>
      <Head>
        <title>Both Teams Played Hard | Bola Presa</title>
      </Head>

      <div
        style={{
          // display: "inline-block",
          // overflow: "hidden",
          position: "relative",
          width: "100%",
          height: "100%",
        }}
      >
        <img
          style={{
            pointerEvents: "none",
            position: "absolute",
            // width: "100%",
            minHeight: "100vh",
            zIndex: -1,
            opacity: 0.4,
          }}
          src="/images/rw_btph.jpg"
        />
      </div>

      {/* TODO: add CSV import and export */}

      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" className={classes.title}>
            Perguntas
          </Typography>
        </Toolbar>
      </AppBar>

      <div className={classes.container}>
        <MessageSelector messages={unreadMessages} reload={reloadMessages}/>
      </div>

      <div className={classes.container}>
        <Paper elevation={3}>
          <TableContainer component={Paper}>
            <Table className={classes.table} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Titulo</TableCell>
                  <TableCell>Remetente</TableCell>
                  <TableCell>Categoria</TableCell>
                  <TableCell align="right">Data</TableCell>
                  <TableCell align="right">Ações</TableCell>
                  {/* 
                    TODO: implement actions: 
                    details -> should open a modal with the message, 
                    edit -> should go to the form with the data prefilled,
                    mark as read -> should mark as read and remove from the list,
                   */}
                </TableRow>
              </TableHead>
              <TableBody>
                {unreadMessages.map((row, key) => (
                  <TableRow key={key}>
                    <TableCell component="th" scope="row">
                      {row.title}
                    </TableCell>
                    <TableCell>{row.sender}</TableCell>
                    <TableCell>
                      {row?.category.map((item) => (
                        <Chip label={item} key={item} />
                      ))}
                    </TableCell>
                    <TableCell align="right">
                      {/* TODO: add humanized dates */}
                      {new Date(row.date).toLocaleString()}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        edge="start"
                        aria-label="menu"
                        onClick={() => {
                          if (ipcRenderer) {
                            ipcRenderer.send("delete-message", key);
                            setMessages(ipcRenderer.sendSync("get-messages"));
                          }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                      <Divider orientation="vertical" />
                      {/* <ShowMessage message={row} /> */}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </div>

      <Link href="/form">
        {/* FIX: position when scroll */}
        <Fab color="primary" aria-label="add" className={classes.fab}>
          <AddIcon className={classes.icon} />
        </Fab>
      </Link>
    </React.Fragment>
  );
};

function MessageSelector({ messages, reload }: any) {
  const [message, setMessage] = useState<any>(undefined);
  const [category, setCategory] = useState<any>("");

  // const [messages, setMessages] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const closeMessageModal = () => setMessage(undefined);

  const readMessage = (message) => {
    if (ipcRenderer) {
      ipcRenderer.send("read-message", { ...message });
    }
    setMessage(undefined);
    reload();
  };

  useEffect(() => {
    // componentDidMount()
    if (ipcRenderer) {
      // setMessages(ipcRenderer.sendSync("get-messages"));
      setCategories(ipcRenderer.sendSync("get-categories"));
    }

    return () => {
      // componentWillUnmount()
    };
  }, []);

  return (
    <div>
      <InputLabel id="demo-simple-select-label">
        Selecionar categoria para sorteio
      </InputLabel>
      <Select
        labelId="demo-simple-select-label"
        id="demo-simple-select"
        style={{ width: 300 }}
        value={category}
        onChange={(event) => {
          setCategory(event.target.value);
        }}
      >
        <MenuItem value={""}>Todas as Categorias</MenuItem>
        {categories.map((item, key) => (
          <MenuItem value={item} key={key}>
            {item}
          </MenuItem>
        ))}
      </Select>
      <Button
        variant="contained"
        style={{ float: "right" }}
        onClick={() => {
          if (!messages.length) return;

          const filteredMessages = category
            ? messages.filter((item) => item.category.includes(category))
            : messages;

          const message =
            filteredMessages[
              Math.floor(Math.random() * Math.floor(filteredMessages.length))
            ];

          setMessage(message);
        }}
      >
        {" "}
        Selecionar mensagem
      </Button>

      {message && (
        <ShowSelectedMessage
          message={message}
          closeMessageModal={closeMessageModal}
          readMessage={readMessage}
        />
      )}
    </div>
  );
}

export default Home;

function ShowSelectedMessage({ message, closeMessageModal, readMessage }: any) {
  const classes = useStyles({});

  const readMessageClick = () => {
    message.read = true;
    readMessage(message);
  }

  return (
    <div>
      <Modal open={Boolean(message)}>
        <div className={classes.container}>
          <Paper elevation={3} style={{ padding: 30 }}>
            <div
              style={{
                float: "right",
              }}
            >
              <Button onClick={closeMessageModal}>
                <CloseIcon />
              </Button>
            </div>
            {message ? (
              <>
                <Typography variant="h5" gutterBottom>
                  Título: {message?.title}
                </Typography>
                <br />
                <Typography variant="h5" gutterBottom>
                  De: {message.sender}
                </Typography>
                <br />
                <Typography variant="h6" gutterBottom>
                  Categorias:{" "}
                  {message?.category?.map((item) => (
                    <Chip label={item} key={item} />
                  ))}
                </Typography>
                <br />
                <Typography variant="body1" gutterBottom>
                  Mensagem: {message.message}
                </Typography>
              </>
            ) : (
              <>
                <div
                  style={{
                    display: "block",
                    marginLeft: "auto",
                    marginRight: "auto",
                    width: "50%",
                  }}
                >
                  <img src="/images/5ee7f5427e733518890918.gif" />
                  <p style={{ textAlign: "center" }}>Sorry...</p>
                </div>
              </>
            )}
            <Divider />
            <Button
              size='large'
              variant="contained"
              color='secondary'
              fullWidth
              onClick={readMessageClick}
            >
              Marcar como lida
            </Button>
          </Paper>
        </div>
      </Modal>
    </div>
  );
}
