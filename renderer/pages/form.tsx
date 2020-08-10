import DateFnsUtils from "@date-io/date-fns";
import { Button } from "@material-ui/core";
import AppBar from "@material-ui/core/AppBar";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import Paper from "@material-ui/core/Paper";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import Autocomplete, {
  createFilterOptions,
} from "@material-ui/lab/Autocomplete";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import electron from "electron";
import { Field, Form, Formik } from "formik";
import { DatePicker } from "formik-material-ui-pickers";
import Head from "next/head";
import Router from "next/router";
import React from "react";
import { Link } from "../components";

const filter = createFilterOptions();

// prevent SSR webpacking
const ipcRenderer = electron.ipcRenderer || false;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      textAlign: "center",
      paddingTop: theme.spacing(4),
    },
    container: {
      padding: 30,
    },
    menuButton: {
      marginRight: theme.spacing(2),
      color: "white",
    },
    submitButton: {
      marginRight: theme.spacing(2),
      float: "right",
    },
    title: {
      flexGrow: 1,
      textAlign: "center",
      color: "white",
    },
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120,
    },
    paper: {
      padding: 30,
      height: 550,
    },
  })
);

const Next = () => {
  const classes = useStyles({});
  const [categories, setCategories] = React.useState([]);

  React.useEffect(() => {
    // componentDidMount()
    if (ipcRenderer) {
      setCategories(ipcRenderer.sendSync("get-categories"));
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

      <AppBar position="static">
        <Toolbar>
          <Link href="/home">
            <IconButton
              edge="start"
              className={classes.menuButton}
              aria-label="menu"
            >
              <ArrowBackIcon />
            </IconButton>
          </Link>
          <Typography variant="h6" className={classes.title}>
            Conte-me mais sobre sua vida amorosa
          </Typography>
        </Toolbar>
      </AppBar>

      <div className={classes.container}>
        <Paper elevation={3} className={classes.paper}>
          {/* TODO: implement form control to save and edit a message */}
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <Formik
              initialValues={{
                read: false,
                title: "",
                sender: "",
                category: [],
                date: new Date(),
                message: "",
              }}
              onSubmit={(values, helpers) => {
                if (ipcRenderer) {
                  ipcRenderer.send("add-message", { ...values });
                  helpers.resetForm();
                  Router.push("/home");
                }
              }}
            >
              {({ submitForm, setFieldValue, values }) => (
                <Form>
                  <Grid container spacing={3}>
                    <Grid item sm={6} md={6} lg={6}>
                      <Field
                        component={TextField}
                        variant="outlined"
                        fullWidth
                        name="title"
                        type="text"
                        label="Titulo"
                        onChange={(event) => {
                          setFieldValue("title", event.target.value);
                        }}
                      />
                    </Grid>
                    <Grid item sm={6} md={6} lg={6}>
                      <Field
                        component={TextField}
                        variant="outlined"
                        fullWidth
                        name="sender"
                        type="text"
                        label="Remetente"
                        onChange={(event) => {
                          setFieldValue("sender", event.target.value);
                        }}
                      />
                    </Grid>
                    <Grid item sm={4} md={4} lg={4}>
                      <Autocomplete
                        value={values.category}
                        onChange={(event, newValue) => {
                          const mappedValues = newValue.map((str: string) =>
                            str.replace("Adicionar ", "")
                          );
                          console.log(mappedValues);
                          setFieldValue("category", [...mappedValues]);

                          if (ipcRenderer) {
                            mappedValues.map((item) => {
                              if (item && !categories.includes(item)) {
                                ipcRenderer.send("add-category", item);
                              }
                            });
                            setCategories(
                              ipcRenderer.sendSync("get-categories")
                            );
                          }
                        }}
                        filterOptions={(options, params) => {
                          const filtered = filter(options, params);
                          console.log(options, params);
                          // const filtered = options;

                          // Suggest the creation of a new value
                          if (params.inputValue !== "") {
                            filtered.push(`Adicionar ${params.inputValue}`);
                          }

                          return filtered;
                        }}
                        selectOnFocus
                        clearOnBlur
                        handleHomeEndKeys
                        multiple
                        id="free-solo-with-text-demo"
                        options={categories}
                        fullWidth
                        freeSolo
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Categoria"
                            variant="outlined"
                          />
                        )}
                      />
                    </Grid>
                    <Grid item sm={4} md={4} lg={4}>
                      {/* TODO: add date localization */}
                      <Field
                        component={DatePicker}
                        name="date"
                        label="Data"
                        variant="outlined"
                        fullWidth
                      />
                    </Grid>
                    <Grid item sm={12} md={12} lg={12}>
                      <Field
                        component={TextField}
                        variant="outlined"
                        multiline
                        fullWidth
                        rows={15}
                        name="message"
                        type="text"
                        label="Messagem"
                        onChange={(event) => {
                          setFieldValue("message", event.target.value);
                        }}
                      />
                    </Grid>
                  </Grid>
                  <Button
                    type="submit"
                    className={classes.submitButton}
                    onClick={submitForm}
                  >
                    Adicionar
                  </Button>
                </Form>
              )}
            </Formik>
          </MuiPickersUtilsProvider>
        </Paper>
      </div>
    </React.Fragment>
  );
};

export default Next;
