"use client";
import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import api from "@/services/api";
import { Button, TextField, MenuItem, Autocomplete } from "@mui/material";
import { useTranslations } from "next-intl";
import Question from "./Question";
import ReactMarkdown from "react-markdown";
import { createTemplate } from "@/services/templateService";
import { uploadImage } from "@/services/uploadService";
import useTagTopicStore, { loadTagTopics } from "@/stores/useTagTopicStore";
import useTemplateStore, { loadTemplates } from "@/stores/useTemplateStore";
import Loading from "@/components/Loading";
import toast from "react-hot-toast";

const CreateTemplate = () => {
  const router = useRouter();
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState("");
  const t = useTranslations("Templates");
  const { topics, tags, setTopics, setTags, setLoading, loading } =
    useTagTopicStore();
  const { setTemplates, setTotal } = useTemplateStore();

  useEffect(() => {
    if (!topics.length || !tags.length) {
      loadTagTopics(setTopics, setTags, setLoading);
    }

    // loadTemplates(setTemplates, setTotal, setLoading);
  }, [setTopics, setTags, setLoading, setTemplates]);

  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
      topic: 0,
      imageUrl: "",
      tags: [],
      accessSettings: { public: true, allowedUsers: [] },
    },
    validationSchema: Yup.object({
      title: Yup.string().required(t("required")),
      description: Yup.string().required(t("required")),
      topic: Yup.number().required(t("required")),
    }),
    onSubmit: async (values) => {
      try {
        const templateData = { ...values, questions, topicId: values.topic };
        const template = await createTemplate(templateData);
        toast.success(template.message);
        router.push("/");
      } catch (error) {
        setError(error.response.data.error);
      }
    },
  });

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: `question-${questions.length + 1}`,
        title: "",
        description: "",
        type: "single-line",
        required: false,
        options: [],
      },
    ]);
  };

  const handleDuplicateQuestion = (index) => {
    const newQuestions = [...questions];
    const questionToDuplicate = {
      ...newQuestions[index],
      id: `question-${questions.length + 1}`,
    };
    newQuestions.splice(index + 1, 0, questionToDuplicate);
    setQuestions(newQuestions);
  };

  const handleDeleteQuestion = (index) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
  };

  const handleDeleteQuestionBttn = () => {
    const newQuestions = [...questions];
    newQuestions.pop();
    setQuestions(newQuestions);
  };

  const handleQuestionChange = (e, index, field) => {
    const { name, value, checked, type } = e.target;
    const newQuestions = [...questions];
    newQuestions[index][field || name] = type === "checkbox" ? checked : value;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (e, questIndex, opIndex) => {
    const { value } = e.target;
    const newQuestions = [...questions];
    newQuestions[questIndex].options[opIndex] = value;
    setQuestions(newQuestions);
  };

  const handleAddOption = (questIndex) => {
    const newQuestions = [...questions];
    newQuestions[questIndex].options.push("");
    setQuestions(newQuestions);
  };

  const handleRemoveOption = (questIndex, opIndex) => {
    const newQuestions = [...questions];
    newQuestions[questIndex].options.splice(opIndex, 1);
    setQuestions(newQuestions);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const newQuestions = [...questions];
    const [reorderedQuestion] = newQuestions.splice(result.source.index, 1);
    newQuestions.splice(result.destination.index, 0, reorderedQuestion);
    setQuestions(newQuestions);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    const response = await uploadImage(file);
    formik.setFieldValue("imageUrl", response.url);
  };

  if (loading) {
    return <Loading />;
  }

  console.log(topics);

  return (
    <form onSubmit={formik.handleSubmit} className="flex flex-col w-full gap-6">
      <TextField
        label={t("title")}
        name="title"
        onChange={formik.handleChange}
        value={formik.values.title}
        error={formik.touched.title && Boolean(formik.errors.title)}
        helperText={formik.touched.title && formik.errors.title}
        fullWidth
        margin="normal"
      />
      <TextField
        label={t("description")}
        name="description"
        onChange={formik.handleChange}
        value={formik.values.description}
        error={formik.touched.description && Boolean(formik.errors.description)}
        helperText={formik.touched.description && formik.errors.description}
        fullWidth
        margin="normal"
        multiline
      />
      <ReactMarkdown>{formik.values.description}</ReactMarkdown>
      <TextField
        select
        label={t("topic")}
        name="topic"
        onChange={formik.handleChange}
        value={formik.values.topic}
        error={formik.touched.topic && Boolean(formik.errors.topic)}
        helperText={formik.touched.topic && formik.errors.topic}
        fullWidth
        margin="normal"
      >
        {topics.length !== 0 ? (
          topics.map((topic) => (
            <MenuItem key={topic.id} value={topic.id}>
              {topic.name}
            </MenuItem>
          ))
        ) : (
          <MenuItem value={0}>{t("noTopics")}</MenuItem>
        )}
      </TextField>
      <Autocomplete
        multiple
        options={tags.map((tag) => tag.name)}
        freeSolo
        value={formik.values.tags}
        onChange={(e, value) => {
          formik.setFieldValue("tags", value);
        }}
        renderInput={(params) => (
          <TextField {...params} label={t("tags")} margin="normal" fullWidth />
        )}
      />
      <Button variant="contained" component="label">
        {t("uploadImage")}
        <input type="file" hidden onChange={handleImageUpload} />
      </Button>
      <Button onClick={handleAddQuestion} variant="contained" color="primary">
        {t("addQuestion")}
      </Button>
      <Button
        onClick={handleDeleteQuestionBttn}
        variant="contained"
        color="primary"
        disabled={questions.length === 0}
      >
        {t("addQuestion")}
      </Button>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="questions">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {questions.map((question, index) => (
                <Question
                  key={question.id}
                  question={question}
                  index={index}
                  handleChange={handleQuestionChange}
                  handleDuplicate={handleDuplicateQuestion}
                  handleDelete={handleDeleteQuestion}
                  handleOptionChange={handleOptionChange}
                  handleAddOption={handleAddOption}
                  handleRemoveOption={handleRemoveOption}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <Button type="submit" variant="contained" color="primary" fullWidth>
        {t("create")}
      </Button>
    </form>
  );
};

export default CreateTemplate;
