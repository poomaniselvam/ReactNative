import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
  Modal,
  Dimensions,
} from "react-native";
import axios from "axios";

const { width } = Dimensions.get("window");

const RatingOption = ({ label, emoji, isSelected, onSelect }) => (
  <TouchableOpacity
    style={[styles.ratingOption, isSelected && styles.selectedRating]}
    onPress={onSelect}
  >
    <Text style={styles.ratingEmoji}>{emoji}</Text>
    <Text style={[styles.ratingLabel, isSelected && styles.selectedRatingLabel]}>
      {label}
    </Text>
  </TouchableOpacity>
);

export default function App() {
  const [formData, setFormData] = useState({
    Name: "",
    email: "",
    Mobile: "",
    rating: "",
    comment: "",
  });

  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    axios.get('https://mediumblue-jellyfish-250677.hostingersite.com/api/question')
      .then((response) => {
        const questionsArray = response.data.questions;
        setQuestions(questionsArray);
      })
      .catch((error) => {
        console.error('Error fetching questions:', error);
      });
  }, []);

  const handleChange = (id, value) => {
    setFormData((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  const handleCheckboxChange = (field, value, checked) => {
    setFormData((prevState) => {
      const updatedValue = checked
        ? prevState[field]
          ? `${prevState[field]},${value}`
          : value
        : prevState[field]
            .split(",")
            .filter((item) => item !== value)
            .join(",");
      return { ...prevState, [field]: updatedValue };
    });
  };

  const handleRatingChange = (value) => {
    setFormData((prevState) => ({
      ...prevState,
      rating: value,
    }));
  };

  const validateStep = () => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.rating) newErrors.rating = "Rating is required.";
      if (!formData.Name) newErrors.Name = "Name is required.";
      if (!formData.email) newErrors.email = "Email is required.";
      if (!formData.Mobile) newErrors.Mobile = "Mobile is required.";
    }
    if (step === 2) {
      questions.forEach((question) => {
        if (!formData[question.id]) {
          newErrors[question.id] = "At least one option is required.";
        }
      });
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (step < 2) setStep((prevStep) => prevStep + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 1) setStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = () => {
    if (validateStep()) {
      console.log("Submitting form data:", formData);

      axios
        .post("https://mediumblue-jellyfish-250677.hostingersite.com/api/rating", formData, {
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then((response) => {
          console.log("Form submitted successfully:", response.data);
          setShowSuccessPopup(true);
        })
        .catch((error) => {
          console.error(
            "There was an error submitting the form!",
            error.response || error.message
          );
          Alert.alert("Error", "There was an error submitting the form!");
        });
    }
  };

  const SuccessPopup = ({ onClose }) => (
    <Modal visible={true} transparent={true} animationType="slide">
      <View style={styles.successPopup}>
        <View style={styles.successPopupContent}>
          <Text style={styles.successTitle}>Success!</Text>
          <Text>Your feedback has been submitted successfully.</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const ratingOptions = [
    { value: "best", label: "Best", emoji: "🌟" },
    { value: "excellent", label: "Excellent", emoji: "🏆" },
    { value: "good", label: "Good", emoji: "👍" },
    { value: "average", label: "Average", emoji: "😐" },
    { value: "poor", label: "Poor", emoji: "👎" },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <View style={styles.progressContainer}>
          <View style={styles.stepProgress}>
            {[1, 2].map((stepNumber) => (
              <View
                key={stepNumber}
                style={[styles.step, step >= stepNumber && styles.activeStep]}
              >
                <Text style={styles.stepText}>{stepNumber}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.headerText}>Feedback Form</Text>

          {step === 1 && (
            <>
              <View style={styles.formGroup}>
                <Text style={styles.subHeaderText}>How was your experience?</Text>
                <View style={styles.ratingContainer}>
                  {ratingOptions.map((option) => (
                    <RatingOption
                      key={option.value}
                      label={option.label}
                      emoji={option.emoji}
                      isSelected={formData.rating === option.value}
                      onSelect={() => handleRatingChange(option.value)}
                    />
                  ))}
                </View>
                {errors.rating && (
                  <Text style={styles.errorText}>{errors.rating}</Text>
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.subHeaderText}>Personal Information</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your name"
                  value={formData.Name}
                  onChangeText={(value) => handleChange("Name", value)}
                />
                {errors.Name && (
                  <Text style={styles.errorText}>{errors.Name}</Text>
                )}
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  value={formData.email}
                  onChangeText={(value) => handleChange("email", value)}
                />
                {errors.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}
                <TextInput
                  style={styles.input}
                  placeholder="Enter your mobile number"
                  keyboardType="phone-pad"
                  value={formData.Mobile}
                  onChangeText={(value) => handleChange("Mobile", value)}
                />
                {errors.Mobile && (
                  <Text style={styles.errorText}>{errors.Mobile}</Text>
                )}
              </View>
            </>
          )}

          {step === 2 && questions.length > 0 && (
            <View style={styles.formGroup}>
              <Text style={styles.subHeaderText}>Feedback</Text>
              {questions.map((question) => (
                <View key={question.id} style={styles.formGroup}>
                  <Text style={styles.questionText}>{question.label} (Select all that apply)</Text>
                  {question.options.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      style={styles.checkboxContainer}
                      onPress={() =>
                        handleCheckboxChange(
                          question.id,
                          option.label,
                          !formData[question.id]
                            ?.split(",")
                            .includes(option.label)
                        )
                      }
                    >
                      <Text style={styles.checkboxLabel}>
                        {formData[question.id]
                          ?.split(",")
                          .includes(option.label)
                          ? "☑"
                          : "☐"}{" "}
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  {errors[question.id] && (
                    <Text style={styles.errorText}>{errors[question.id]}</Text>
                  )}
                </View>
              ))}
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter additional comments"
                value={formData.comment}
                onChangeText={(value) => handleChange("comment", value)}
                multiline={true}
                numberOfLines={4}
              />
            </View>
          )}

          <View style={styles.buttonContainer}>
            {step > 1 && (
              <TouchableOpacity onPress={handlePrevious} style={styles.button}>
                <Text style={styles.buttonText}>Previous</Text>
              </TouchableOpacity>
            )}
            {step < 2 && (
              <TouchableOpacity onPress={handleNext} style={styles.button}>
                <Text style={styles.buttonText}>Next</Text>
              </TouchableOpacity>
            )}
            {step === 2 && (
              <TouchableOpacity onPress={handleSubmit} style={styles.button}>
                <Text style={styles.buttonText}>Submit</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
      {showSuccessPopup && (
        <SuccessPopup
          onClose={() => {
            setShowSuccessPopup(false);
            setFormData({
              Name: "",
              email: "",
              Mobile: "",
              rating: "",
              comment: "",
            });
            setStep(1);
          }}
        />
      )}
    </ScrollView>
  );
}
// ... (previous code remains the same)

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: "#f5f5f5",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: width - 40,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 15,
    elevation: 5,
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  stepProgress: {
    flexDirection: "row",
    alignItems: "center",
  },
  step: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderColor: "#ddd",
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
  },
  activeStep: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  stepText: {
    color: "#333",
    fontWeight: "bold",
    fontSize: 18,
  },
  cardBody: {
    paddingHorizontal: 10,
  },
  headerText: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  subHeaderText: {
    fontSize: 20,
    marginBottom: 15,
    color: "#4CAF50",
    fontWeight: "600",
  },
  formGroup: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  textArea: {
    height: 100,
  },
  ratingContainer: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  ratingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  selectedRating: {
    backgroundColor: '#4CAF50',
  },
  ratingEmoji: {
    fontSize: 28,
    marginRight: 15,
  },
  ratingLabel: {
    fontSize: 18,
    color: '#333',
  },
  selectedRatingLabel: {
    color: '#fff',
    fontWeight: 'bold',
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    padding: 10,
  },
  checkboxLabel: {
    marginLeft: 10,
    fontSize: 16,
    color: "#333",
  },
  errorText: {
    color: "#ff3b30",
    fontSize: 14,
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  button: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  successPopup: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  successPopupContent: {
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 12,
    width: width - 60,
    alignItems: "center",
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
    color: "#4CAF50",
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignSelf: "stretch",
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  questionText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#333",
  },
});



