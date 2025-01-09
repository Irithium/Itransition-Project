"use client";
import { Draggable } from "@hello-pangea/dnd";
import {
  TextField,
  IconButton,
  MenuItem,
  Switch,
  Button,
  Box,
  Checkbox,
  MenuList,
} from "@mui/material";
import {
  FileCopy,
  Delete,
  Remove,
  Add,
  MoreVert,
  Check,
} from "@mui/icons-material";
import { useTranslations } from "next-intl";
import { useState } from "react";

const Question = ({
  question,
  index,
  handleChange,
  handleDuplicate,
  handleDelete,
  handleOptionChange,
  handleAddOption,
  handleRemoveOption,
}) => {
  const [seeOptions, setSeeOptions] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const t = useTranslations("Templates");

  const questionTypes = [
    { value: "single-line", label: t("singleLine") },
    { value: "multiple-line", label: t("multipleLine") },
    { value: "integer", label: t("integer") },
    { value: "checkbox", label: t("checkbox") },
  ];

  const handleDisplayButton = () => {
    setSeeOptions(!seeOptions);
  };
  const handleDisplayDescription = () => {
    setIsVisible(!isVisible);
    setSeeOptions(false);
  };

  return (
    <Draggable draggableId={question.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="question-container flex flex-col bg-slate-100 px-6 py-2 rounded-md my-2 shadow-md border border-gray-300"
        >
          <TextField
            label={t("title")}
            name="title"
            value={question.title}
            onChange={(e) => handleChange(e, index)}
            fullWidth
            margin="normal"
          />
          <TextField
            label={t("description")}
            name="description"
            value={question.description}
            onChange={(e) => handleChange(e, index)}
            fullWidth
            margin="normal"
            multiline
            className={`${isVisible === true ? "visible" : "hidden"}`}
          />
          <TextField
            select
            label={t("questionType")}
            name="questionType"
            value={question.questionType}
            onChange={(e) => handleChange(e, index)}
            fullWidth
            margin="normal"
          >
            {questionTypes.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          {question.questionType === "single-line" && (
            <TextField
              name="answer"
              value={question.answer || ""}
              onChange={(e) => handleChange(e, index)}
              fullWidth
              margin="normal"
              variant="standard"
              placeholder={t("shortResponse")}
              disabled
              className="placeholder:text-gray-600"
            />
          )}
          {question.questionType === "multiple-line" && (
            <TextField
              name="answer"
              value={question.answer || ""}
              onChange={(e) => handleChange(e, index)}
              fullWidth
              margin="normal"
              multiline
              variant="standard"
              placeholder={t("longResponse")}
              disabled
              className=" text-gray-600"
            />
          )}
          {question.questionType === "integer" && (
            <Box display="flex" alignItems="center">
              <IconButton
                onClick={() => {
                  const currentValue = parseInt(question.answer) || 0;
                  handleChange(
                    {
                      target: {
                        name: "answer",
                        value: currentValue - 1,
                      },
                    },
                    index
                  );
                }}
                disabled
              >
                <Remove />
              </IconButton>
              <TextField
                name="answer"
                value={question.answer}
                onChange={(e) => {
                  if (/^\d*$/.test(e.target.value)) {
                    handleChange(e, index);
                  }
                }}
                margin="normal"
                className="max-w-36 overflow-x-auto"
                placeholder={0}
                disabled
              />
              <IconButton
                onClick={() => {
                  const currentValue = parseInt(question.answer) || 0;
                  handleChange(
                    {
                      target: {
                        name: "answer",
                        value: currentValue + 1,
                      },
                    },
                    index
                  );
                }}
                disabled
              >
                <Add />
              </IconButton>
            </Box>
          )}
          {question.questionType === "checkbox" && (
            <Box>
              {question.options.map((option, opIndex) => (
                <Box
                  key={opIndex}
                  display="flex"
                  alignItems="center"
                  className="my-2 max-w-fit cursor-default "
                >
                  <Checkbox
                    value={option.value}
                    onChange={(e) => handleOptionChange(e, index, opIndex)}
                    margin="normal"
                    size="small"
                    checked={false}
                    disabled
                  />
                  <TextField
                    variant="standard"
                    name="title"
                    onChange={(e) => handleOptionChange(e, index, opIndex)}
                    value={option.title}
                    className="min-w-36 max-w-48"
                    size="small"
                    placeholder={t("option")}
                  />

                  <IconButton
                    onClick={() => handleRemoveOption(index, opIndex)}
                  >
                    <Delete />
                  </IconButton>
                </Box>
              ))}
              <Button
                onClick={() => handleAddOption(index)}
                variant="contained"
                color="primary"
                className="my-2"
              >
                {t("addOption")}
              </Button>
            </Box>
          )}
          <div className="question-actions flex justify-end py-2 mt-3 border-t border-gray-300 gap-4 md:gap-2  items-center">
            <div className="border-r px-2 border-gray-300 gap-2">
              <IconButton onClick={() => handleDuplicate(index)}>
                <FileCopy />
              </IconButton>
              <IconButton onClick={() => handleDelete(index)}>
                <Delete />
              </IconButton>
            </div>
            <div className="flex gap-1 items-center px-2">
              <span className="text-gray-600">{t("required")}</span>
              <Switch
                checked={question.required}
                onClick={(e) => handleChange(e, index)}
                name="required"
                color="primary"
              />
              <div className="relative flex flex-col gap-2">
                <IconButton onClick={() => handleDisplayButton()}>
                  <MoreVert className="text-gray-500 " />
                </IconButton>
                <MenuList
                  className={`flex flex-col bg-slate-100 z-10 rounded shadow-md  justify-start items-start py-2 absolute top-3/4 transform  translate-y-2 cursor-default ${
                    seeOptions ? "visible" : "hidden"
                  }`}
                >
                  <span className="text-sm px-4 py-1 text-gray-400">
                    {t("display")}
                  </span>
                  <MenuItem
                    onClick={() => handleDisplayDescription()}
                    className="flex flex-row justify-between cursor-pointer"
                  >
                    <Check
                      className={`text-gray-500 ${
                        isVisible ? "visible" : "invisible"
                      } `}
                    />
                    <div className="px-3 text-gray-800">{t("description")}</div>
                  </MenuItem>
                </MenuList>
              </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default Question;
