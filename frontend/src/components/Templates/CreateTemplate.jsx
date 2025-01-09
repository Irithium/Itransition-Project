"use client";
import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import {
  Button,
  TextField,
  MenuItem,
  Autocomplete,
  IconButton,
  Switch,
} from "@mui/material";
import { useTranslations } from "next-intl";
import Question from "./Question";
import { createTemplate } from "@/services/templateService";
import { uploadImage } from "@/services/uploadService";
import useTagTopicStore, { loadTagTopics } from "@/stores/useTagTopicStore";
import Loading from "@/components/Loading";
import toast from "react-hot-toast";
import {
  AddCircleOutline,
  Clear,
  Delete,
  ImageOutlined,
  Publish,
  RemoveCircleOutline,
} from "@mui/icons-material";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import Image from "next/image";
import { searchUsers } from "@/services/userServices";

const CreateTemplate = () => {
  const router = useRouter();
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState("");
  const [isDisabled, setIsDisabled] = useState(true);
  const [userOptions, setUserOptions] = useState([]);
  const t = useTranslations("Templates");
  const { topics, tags, setTopics, setTags, setLoading, loading } =
    useTagTopicStore();

  useEffect(() => {
    if (!topics.length || !tags.length) {
      loadTagTopics(setTopics, setTags, setLoading);
    }
  }, [setTopics, setTags, setLoading, topics.length, tags.length]);

  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
      topicId: 0,
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
      const formattedQuestions = questions.map((question) => ({
        title: question.title,
        description: question.description,
        questionType: question.questionType,
        required: question.required,
        options: question.options,
      }));
      try {
        const templateData = { ...values, questions: formattedQuestions };
        const template = await createTemplate(templateData);
        toast.success(template.message);
        router.push("/");
      } catch (error) {
        setError(error.response.data.error);
      }
    },
  });

  useEffect(() => {
    if (
      questions.length !== 0 &&
      formik.values.title !== "" &&
      formik.values.description !== ""
    )
      setIsDisabled(false);
    else setIsDisabled(true);
  }, [isDisabled, questions, formik.values.title, formik.values.description]);

  const handleAddQuestion = () => {
    const maxId = questions.reduce((max, question) => {
      return Math.max(max, question.id);
    }, 0);
    const order =
      maxId > questions.length + 1 ? maxId + 1 : questions.length + 1;
    setQuestions([
      ...questions,
      {
        id: `${order}`,
        title: "",
        description: "",
        questionType: "single-line",
        required: false,
        options: [],
      },
    ]);
  };

  const handleDuplicateQuestion = (index) => {
    const newQuestions = [...questions];
    const questionToDuplicate = {
      ...newQuestions[index],
      id: `${questions.length + 1}`,
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
    const { name, value, checked, questionType } = e.target;
    const newQuestions = [...questions];

    if (name === "required") {
      newQuestions[index].required = checked;
      setQuestions(newQuestions);
      return;
    }
    newQuestions[index][field || name] =
      questionType === "checkbox" ? checked : value;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (e, questIndex, opIndex) => {
    const { value } = e.target;
    const newQuestions = [...questions];
    newQuestions[questIndex].options[opIndex].title = value;
    newQuestions[questIndex].options[opIndex].value = value;
    setQuestions(newQuestions);
  };

  const handleAddOption = (questIndex) => {
    const newQuestions = [...questions];
    newQuestions[questIndex].options.push({
      id: newQuestions[questIndex].options.length + 1,
      title: "",
      value: "",
    });
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
    if (file) {
      toast
        .promise(uploadImage(file), {
          loading: t("uploadingImage"),
          success: t("imageUploaded"),
          error: t("imageUploadFailed"),
        })
        .then((response) => {
          const { url } = response;
          console.log(url);
          formik.setFieldValue("imageUrl", url);
        })
        .catch((error) => {
          console.error("Image upload error:", error);
        });
    }
  };

  const handleDeleteImage = () => {
    formik.setFieldValue("imageUrl", "");
  };

  const handleSearchUsers = async (query) => {
    try {
      const response = await searchUsers(query);
      setUserOptions(response);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="relative flex flex-col items-center w-full bg-[#ffaf85]/60 min-h-screen">
      <form
        onSubmit={formik.handleSubmit}
        className="flex flex-col w-full md:w-1/2 mx-auto gap-4 mt-6 relative pb-10"
      >
        {formik.values.imageUrl !== "" && (
          <div className="relative flex justify-center rounded-md bg-slate-100 shadow-md items-center  overflow-hidden  ">
            <Image
              src={formik.values?.imageUrl}
              width={300}
              height={150}
              className="w-full h-full rounded-md "
              alt="Image"
            />

            <IconButton
              onClick={() => handleDeleteImage()}
              className={`absolute top-4 text-black right-0 transform -translate-x-1/2 bg-white py-2 `}
            >
              <Clear />
            </IconButton>
          </div>
        )}

        <div className="border-t-4 rounded-md border-[#DA6C70] bg-slate-100 px-6 py-4 shadow-md h-auto">
          <TextField
            label={t("title")}
            name="title"
            onChange={formik.handleChange}
            value={formik.values.title}
            error={formik.touched.title && Boolean(formik.errors.title)}
            helperText={formik.touched.title && formik.errors.title}
            fullWidth
            margin="filled"
            variant="standard"
          />
          <TextField
            label={t("description")}
            name="description"
            onChange={formik.handleChange}
            value={formik.values.description}
            error={
              formik.touched.description && Boolean(formik.errors.description)
            }
            helperText={formik.touched.description && formik.errors.description}
            fullWidth
            margin="normal"
            variant="standard"
            multiline
            className="text-sm"
          />
          <div className="mt-2">
            <h3 className="text-sm font-semibold">{t("preview")}:</h3>
            <div className="p-2 border rounded-md bg-white max-w-full  break-words">
              {typeof window !== "undefined" && (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                >
                  {formik.values.description}
                </ReactMarkdown>
              )}
            </div>
          </div>
        </div>

        <div
          className={`rounded-md bg-slate-100 px-6 py-4 shadow-md focus-within::border-l-4 focus-within::border-[#A36672]`}
        >
          <TextField
            select
            label={t("topic")}
            name="topicId"
            onChange={formik.handleChange}
            value={formik.values.topicId}
            error={formik.touched.topicId && Boolean(formik.errors.topicId)}
            helperText={formik.touched.topicId && formik.errors.topicId}
            fullWidth
            margin="normal"
          >
            <MenuItem key={0} value={0} className="">
              {t("selectTopic")}
            </MenuItem>
            {topics.length !== 0 ? (
              topics.map((topic) => (
                <MenuItem key={topic.id} value={topic.id}>
                  {topic.title}
                </MenuItem>
              ))
            ) : (
              <MenuItem value={0}>{t("noTopics")}</MenuItem>
            )}
          </TextField>

          <Autocomplete
            multiple
            options={tags.map((tag) => tag.title)}
            freeSolo
            value={formik.values.tags}
            onChange={(e, value) => {
              formik.setFieldValue("tags", value);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t("tags")}
                margin="normal"
                fullWidth
              />
            )}
          />

          <div className="flex flex-row items-center gap-4 w-full">
            <div className="flex flex-row items-center gap-2">
              <span className="text-gray-800">
                {formik.values.accessSettings.public
                  ? t("public")
                  : t("private")}
              </span>
              <Switch
                checked={formik.values.accessSettings.public}
                onChange={(e) =>
                  formik.setFieldValue(
                    "accessSettings.public",
                    e.target.checked
                  )
                }
                name="accessSettings.public"
                color="primary"
              />
            </div>
            {!formik.values.accessSettings.public && (
              <Autocomplete
                multiple
                options={userOptions.map((user) => user.email)}
                value={formik.values.accessSettings.allowedUsers}
                onChange={(e, value) => {
                  formik.setFieldValue("accessSettings.allowedUsers", value);
                }}
                onInputChange={(e, value) => {
                  handleSearchUsers(value);
                }}
                fullWidth
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t("allowedUsers")}
                    margin="normal"
                    fullWidth
                  />
                )}
                className="transition"
              />
            )}
          </div>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable
            droppableId="questions"
            isDropDisabled={false}
            isCombineEnabled={false}
            ignoreContainerClipping={false}
          >
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
        <div
          name="Buttons"
          className="flex md:flex-col max-md:w-1/2 max-md:border max-md:border-gray-300 gap-2 fixed z-10 bg-slate-100 transform max-md:bottom-0 justify-between left-1/4 md:left-3/4 md:translate-x-1/3 p-1 max-md:px-4 rounded-t-md md:rounded-md md:shadow-md "
        >
          <IconButton
            variant="contained"
            component="label"
            className="relative flex group items-center justify-center"
          >
            <ImageOutlined />
            <span className="absolute transition transform -translate-y-full mb-2 whitespace-nowrap hidden group-hover:block bg-gray-800/70 text-white text-xs rounded py-1 px-2 w-fit">
              {t("uploadImage")}
            </span>
            <input type="file" hidden onChange={handleImageUpload} />
          </IconButton>
          <IconButton
            onClick={handleAddQuestion}
            variant="contained"
            color="primary"
            className="relative flex group items-center justify-center"
          >
            <AddCircleOutline className="text-gray-500" />
            <span className="absolute transition transform -translate-y-full mb-2 whitespace-nowrap hidden group-hover:block bg-gray-800/70 text-white text-xs rounded py-1 px-2 w-fit">
              {t("addQuestion")}
            </span>
          </IconButton>
          <IconButton
            onClick={handleDeleteQuestionBttn}
            variant="contained"
            color="primary"
            disabled={questions.length === 0}
            className="relative flex group items-center justify-center disabled:opacity-70"
          >
            <RemoveCircleOutline className="text-gray-500 " />
            <span className="absolute transition  transform -translate-y-full mb-2 whitespace-nowrap hidden group-hover:block bg-gray-800/70 text-white text-xs rounded py-1 px-2 w-fit">
              {t("deleteQuestion")}
            </span>
          </IconButton>
          <IconButton type="submit" className="md:hidden" disabled={isDisabled}>
            <Publish />
          </IconButton>
        </div>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={isDisabled}
          className="max-md:hidden"
          size="large"
        >
          {t("create")}
        </Button>
      </form>
    </div>
  );
};

export default CreateTemplate;
