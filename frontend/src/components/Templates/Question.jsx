"use client";
import { Draggable } from "react-beautiful-dnd";
import {
  TextField,
  IconButton,
  MenuItem,
  Switch,
  Button,
  Icon,
} from "@mui/material";
import {
  DeleteIcon,
  FileCopyIcon,
  AddIcon,
  RemoveIcon,
} from "@mui/icons-material";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("Templates");

  const questionTypes = [
    { value: "single-line", label: t("singleLine") },
    { value: "multiple-line", label: t("multipleLine") },
    { value: "integer", label: t("integer") },
    { value: "checkbox", label: t("checkbox") },
  ];

  return (
    <Draggable draggableId={question.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="question-container"
        >
          <TextField
            label={t("questionTitle")}
            name="title"
            value={question.title}
            onChange={(e) => handleChange(e, index)}
            fullWidth
            margin="normal"
          />
          <TextField
            label={t("questionDescription")}
            name="description"
            value={question.description}
            onChange={(e) => handleChange(e, index)}
            fullWidth
            margin="normal"
            multiline
          />
          <TextField
            select
            label={t("questionType")}
            name="type"
            value={question.type}
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
          {question.type === "single-line" && (
            <TextField
              name="answer"
              value={question.answer || ""}
              onChange={(e) => handleChange(e, index)}
              fullWidth
              margin="normal"
            />
          )}
          {question.type === "multiple-line" && (
            <TextField
              name="answer"
              value={question.answer || ""}
              onChange={(e) => handleChange(e, index)}
              fullWidth
              margin="normal"
              multiline
            />
          )}
          {question.type === "integer" && (
            <Box display="flex" alignItems="center">
              <IconButton
                onClick={() =>
                  handleChange(
                    {
                      target: {
                        name: "answer",
                        value: (question.answer || 0) - 1,
                      },
                    },
                    index
                  )
                }
              >
                <RemoveIcon />
              </IconButton>
              <TextField
                name="answer"
                value={question.answer || 0}
                onChange={(e) => handleChange(e, index)}
                margin="normal"
              />
              <IconButton
                onClick={() =>
                  handleChange(
                    {
                      target: {
                        name: "answer",
                        value: (question.answer || 0) + 1,
                      },
                    },
                    index
                  )
                }
              >
                <AddIcon />
              </IconButton>
            </Box>
          )}
          {question.type === "checkbox" && (
            <Box>
              {questi.options.map((option, opIndex) => (
                <Box key={opIndex} display="flex" alignItems="center">
                  <TextField
                    name={`option-${opIndex}`}
                    value={option}
                    onChange={(e) => handleOptionChange(e, index, opIndex)}
                    fullWidth
                    margin="normal"
                  />
                  <IconButton
                    onClick={() => handleRemoveOption(index, opIndex)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              <Button
                onClick={() => handleAddOption(index)}
                variant="contained"
                color="primary"
              >
                {t("addOption")}
              </Button>
            </Box>
          )}
          <div className="question-actions">
            <Switch
              checked={question.required}
              onChange={(e) => handleChange(e, index, "required")}
              name="required"
              color="primary"
            />
            <IconButton onClick={() => handleDuplicate(index)}>
              <FileCopyIcon />
            </IconButton>
            <IconButton onClick={() => handleDelete(index)}>
              <DeleteIcon />
            </IconButton>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default Question;
