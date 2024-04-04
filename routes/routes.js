// Import necessary modules.
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Calculate the directory name of the current module.
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize the express router.
const router = express.Router();

const getCourses = () => {
  const dataDirectory = path.join(__dirname, '..', 'data');
  const categoriesDirectory = path.join(dataDirectory, 'categories.json');
  const categoryData = JSON.parse(fs.readFileSync(categoriesDirectory, 'utf8'));

  const courses = [];

  categoryData.forEach(category => {
    const categoryDir = path.join(dataDirectory, 'courses', category.id);
    
    const courseFiles = fs.readdirSync(categoryDir);

    courseFiles.forEach(file => {
      const coursePath = path.join(categoryDir, file);
      const course = JSON.parse(fs.readFileSync(coursePath, 'utf8'));
      course.categoryName = category.category;
      courses.push(course);
    });
  });

  return courses;
};

const getCourse = (catID, courseID) => {
  const courseFilePath = path.join(__dirname, `../data/courses/${catID}/${courseID}.json`);
  if(fs.existsSync(courseFilePath)) {
    const course = JSON.parse(fs.readFileSync(courseFilePath, 'utf8'));
    return course;
  } else {
    return null;
  }
}

const createCategoryCoursesJson = () => {
  const baseDirectory = path.join(__dirname, '..', 'data');
  const categoriesFile = path.join(baseDirectory, 'categories.json');
  const categoryData = JSON.parse(fs.readFileSync(categoriesFile, 'utf8'));

  const categoryCoursesJson = {};

  categoryData.forEach(category => {
    const categoryDir = path.join(baseDirectory, 'courses', category.id);

    if (!fs.existsSync(categoryDir)) {
      // If the category directory doesn't exist, skip this category
      return;
    }

    const courseFiles = fs.readdirSync(categoryDir);
    const courseData = courseFiles.map(file => {
      const coursePath = path.join(categoryDir, file);
      const courseContent = JSON.parse(fs.readFileSync(coursePath, 'utf8'));
      return {
        title: courseContent.title, 
        creator: courseContent.creator, 
        heroImg: courseContent.heroImg, 
        shortDescription: courseContent.shortDescription, 
        difficultyLevel: courseContent.difficultyLevel,
        id: courseContent.id,
        category: courseContent.category
      };
    });

    categoryCoursesJson[category.id] = {
      ...category, // Spread the category details
      courses: courseData
    };
  });

  return categoryCoursesJson;
};

const getCategory = (categoryId) => {
  const categories = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/categories.json'), 'utf8'));
  return categories.find(c => c.id === categoryId);
}

// Home route
router.get('/', (req, res) => {
  
  try {
    const courses = getCourses(); // Fetch the courses
    res.render('home', { courses }); // Pass courses to your template
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).send('An error occurred');
  }
});

// Courses route
router.get('/courses', (req, res) => {
  res.render('courses', {
    categories: createCategoryCoursesJson()
  });
});


router.get('/course', (req, res) => {
  const courseId = req.query.id;
  const categoryId = req.query.category;
  
  const courseData = getCourse(categoryId, courseId);
  const category = getCategory(categoryId);
  
  res.render('courseDetail', { 
    course: {
      ...courseData,
      categoryName: category ? category.category : 'Unknown'
    }
  });
});

// Route to start a course
router.get('/start-course', async (req, res) => {
  const courseId = req.query.courseId;
  const categoryId = req.query.categoryId;
  const courseData = getCourse(categoryId, courseId);

  res.render('courseContent', { 
    course: courseData,
   });
});

router.get('/genContent', (req, res) => {
  res.render('genContent');
});

// Export the router
export default router;