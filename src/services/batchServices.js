import e from "express";
import { ErrorHandler } from "./../exceptions/errorHandler.js";
import { BatchCourses, Batches, BatchFields, Courses, Database } from "./../models/index.js";
import { Sequelize } from "sequelize";

/**
 * ========
 * BATCHES
 * --------
 * - Get all batches & get batch by id
 * - Create batch
 * - Update batch
 */


// Get all batches & get batch by id
export async function getBatchService({ req }) {

  if (req.params.id) {
    try {
      // check parameter id
      let batchId = parseInt(req.params.id) || null;
      if (typeof (batchId) !== "number") {
        throw new ErrorHandler(400, "Bad Request", [
          { parameter: "id", message: "Invalid batch id" },
          { parameter: "id", message: "Id must be a number" }
        ])
      }

      // Get batch by id
      const batch = await Batches.findOne({ where: { id: req.params.id } })
      if (!batch) {
        throw new ErrorHandler(404, "Not Found", [
          { parameter: "id", message: "Invalid batch ID" },
        ])
      }

      // Get batchCourses
      const batchCourses = await BatchCourses.findAll({ where: { batchId: batch.id } })
      const batchFields = await BatchFields.findAll({ where: { batchId: batch.id } })

      const data = {
        batchId: batch.id,
        batchName: batch.batchName,
        batchCourses: batchCourses,
        lastModify: batch.lastUpdate,
        createdAt: batch.createdAt,
        updatedAt: batch.updatedAt,
        isFinal: batch.isFinal,
        startDate: batch.startDate,
        endDate: batch.endDate,
        projectRequirements: batchFields
      }

      // return course
      return data;
    } catch (error) {
      throw error;
    }
  }

  // check if request query
  const page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.limit) || 5;
  // set maximum limit is 20 
  (limit > 20) ? limit = 20 : limit;
  
  try {
    // prepare query
    const options = {
      raw: true,
      attributes: [
        ["id", "batchId"],
        ["name", "batchName"],
        ["last_update","lastModify"],
        "isFinal",
        "startDate",
        "endDate",
        ["created_at", "createdAt"],
        ["updated_at", "updatedAt"],
      ],
      include: [
        {
          model: Courses,
          as: "batchCourses",
          attributes: [["id", "courseId"], ["name", "courseName"]],
          through: { attributes: [], }, // Hide batch_course
        },
        {
          model: BatchFields,
          as: "projectRequirements",
          attributes: [
            ["field_name", "label"],
            ["field_type", "type"],
            [Sequelize.literal("IF(is_required IS NOT NULL AND is_required = 1, TRUE, FALSE)"), "required"],
          ],
        }
      ],
      page,
      paginate: limit,
      order: [["created_at", "DESC"]],
    }
    // get all data limit with sequelize-paginate
    const batches = await Batches.paginate(options);
    const formattedData = [];
    const batchMap = new Map();

    batches.docs.forEach(row => {
      const batchId = row.batchId;

      if (!batchMap.has(batchId)) {
        batchMap.set(batchId, {
          batchId: row.batchId,
          batchName: row.batchName,
          lastModify: row.lastModify,
          isFinal: !!row.isFinal,
          startDate: row.startDate,
          endDate: row.endDate,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          batchCourses: [],
          projectRequirements: new Map() // Use Map
        });
      }

      const batch = batchMap.get(batchId);

      // **Handle batchCourses without duplicate**
      if (!batch.batchCourses.find(c => c.courseId === row['batchCourses.courseId'])) {
        batch.batchCourses.push({
          courseId: row['batchCourses.courseId'],
          courseName: row['batchCourses.courseName']
        });
      }

      // **Handle projectRequirements without duplicate**
      const requirementKey = `${row['projectRequirements.label']}-${row['projectRequirements.type']}-${row['projectRequirements.required']}`;
      if (!batch.projectRequirements.has(requirementKey)) {
        batch.projectRequirements.set(requirementKey, {
          label: row['projectRequirements.label'],
          type: row['projectRequirements.type'],
          required: !!row['projectRequirements.required']
        });
      }
    });

    // Convert Map to array
    formattedData.push(...batchMap.values());

    // Convert `projectRequirements` Map to array
    formattedData.forEach(batch => {
      batch.projectRequirements = Array.from(batch.projectRequirements.values());
    });
    batches.docs = formattedData;


    const result = {
      paginate: {
        currentPage: page,
        totalPages: batches.pages,
        totalItems: batches.total,
      },
      data: batches.docs
    }

    // return result
    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// Create batch
export async function createBatchService(batchRequest) {
  const transaction = await Database.transaction(); // Start transaction

  try {
    const { batchName, courses, lastUpdate, projectRequirements } = batchRequest;

    // **Step 1: Create Batch**
    const batch = await Batches.create(
      {
        batchName,
        lastModify: lastUpdate,
      },
      { transaction }
    );

    // **Step 2: Insert into batch_courses**
    if (Array.isArray(courses) && courses.length > 0) {
      const batchCoursesData = courses.map((courseId) => ({
        batchId: batch.id,
        courseId,
      }));

      await BatchCourses.bulkCreate(batchCoursesData, { transaction });
    }

    // **Step 3: Insert into batch_fields**
    if (Array.isArray(projectRequirements) && projectRequirements.length > 0) {
      const batchFieldsData = projectRequirements.map((field) => ({
        batchId: batch.id,
        fieldName: field.label,
        fieldType: field.type,
        isRequired: field.required || false,
      }));

      await BatchFields.bulkCreate(batchFieldsData, { transaction });
    }

    // Commit transaction
    await transaction.commit();

    // **Step 4: Get new data**
    const newBatch = await Batches.findByPk(batch.id, {
      include: [
        {
          model: Courses,
          as: "batchCourses",
          attributes: ["id", "courseName"],
        },
        {
          model: BatchFields,
          as: "projectRequirements",
          attributes: ["fieldName", "fieldType", "isRequired"],
        },
      ]
    });
    
    return {
      batchId: newBatch.id,
      batchName: newBatch.batchName,
      batchCourses: newBatch.batchCourses.map((course) => ({
        courseId: course.id,
        courseName: course.courseName,
      })),
      lastModify: newBatch.lastModify,
      createdAt: newBatch.createdAt,
      updatedAt: newBatch.updatedAt,
      isFinal: newBatch.isFinal,
      startDate: newBatch.startDate,
      endDate: newBatch.endDate,
      projectRequirements: newBatch.projectRequirements.map((field)=>({
        label: field.fieldName,
        type: field.fieldType,
        required: field.isRequired
      })),
    }
  } catch (error) {
    console.log("Create Batch: ",error);
    await transaction.rollback();
    throw error;
  }
}

// Update batch
export async function updateBatchService({ req, res }, batchRequest) {
  const transaction = await Database.transaction();
  try {
    // check parameter id start 
    const batchId = parseInt(req.params.id) || null;
    if (!batchId) {
      throw new ErrorHandler(400, "Bad Request", [
        { parameter: "id", message: "Required batch ID" }
      ])
    }

    if (typeof (batchId) !== "number") {
      throw new ErrorHandler(400, "Bad Request", [
        { parameter: "id", message: "Invalid batch ID" },
        { parameter: "id", message: "Batch ID must be a number" }
      ])
    }

    const batch = await Batches.findOne({ where: { id: batchId } })
    if (!batch) {
      throw new ErrorHandler(404, "Not Found", [
        { parameter: "id", message: "Invalid batch ID" }
      ])
    }
    // check batch id end 

    const { batchName, courses, projectRequirements, lastUpdate } = batchRequest;

    // Update Batch Info
    await Batches.update(
      { batchName, lastModify: lastUpdate },
      { where: { id: batchId }, transaction }
    );

    // Handle Batch Courses
    const existingCourses = await BatchCourses.findAll({
      where: { batchId },
      attributes: ["courseId"]
    });

    const newCourseIds = courses; // courses from request
    const coursesToDelete = existingCourses
      .map((course) => course.courseId)
      .filter((id) => !newCourseIds.includes(id));

    // Delete courses user remove
    if (coursesToDelete.length > 0) {
      coursesToDelete.forEach(async (courseId) => {
        await BatchCourses.destroy({
          where: { courseId, batchId },
          transaction
        });
      })
    }

    // Bulk create for create/update new courses
    await BatchCourses.bulkCreate(
      newCourseIds.map((courseId) => ({batchId, courseId})),
      {
        updateOnDuplicate: ["id","batchId", "courseId"],
        transaction
      }
    );

    // Handle Batch Fields (Project Requirements)
    const existingFields = await BatchFields.findAll({
      where: { batchId },
      attributes: ["id", "fieldName", "fieldType", "isRequired"]
    });

    // relabel projectRequirements
    const newFields = projectRequirements.map((req) => ({
      fieldName: req.label,
      fieldType: req.type,
      isRequired: req.required || false, // set default value if user not set
    }));

    // find data to delete
    const fieldsToDelete = existingFields.filter(
      (field) => !newFields.some((newField) => newField.fieldName === field.fieldName)
    );

    // Delete fields user remove
    if (fieldsToDelete.length > 0) {
      await BatchFields.destroy({
        where: { id: fieldsToDelete.map((field) => field.id) },
        transaction
      });
    }

    // find data to update example (label/type/required)
    const fieldsToUpdate = existingFields.filter((field) =>
      newFields.some(
        (newField) =>
          newField.fieldName === field.fieldName &&
          (newField.fieldType !== field.fieldType || newField.isRequired !== field.isRequired)
      )
    );

    for (const field of fieldsToUpdate) {
      const newField = newFields.find((nf) => nf.fieldName === field.fieldName);
      await BatchFields.update(
        { fieldType: newField.fieldType, isRequired: newField.isRequired },
        { where: { id: field.id }, transaction }
      );
    }
    
    // Bulk create for create/update new fields
    const fieldsToInsert = newFields.filter(
      (newField) => !existingFields.some((field) => field.fieldName === newField.fieldName)
    );

    if (fieldsToInsert.length > 0) {
      await BatchFields.bulkCreate(
        fieldsToInsert.map((field) => ({
          batchId,
          fieldName: field.fieldName,
          fieldType: field.fieldType,
          isRequired: field.isRequired,
        })),
        { transaction }
      );
    }

    // Get all data after update
    const updatedBatch = await Batches.findByPk(batchId, {
      include: [
        {
          model: Courses, 
          as: "batchCourses",
          attributes: ["id", "courseName"] 
        },
        {
          model: BatchFields,
          as: "projectRequirements",
          attributes: ["fieldName", "fieldType", "isRequired"]
        }
      ],
      transaction
    });

    // transaction Commit
    await transaction.commit();

    return {
      batchId: updatedBatch.id,
      batchName: updatedBatch.batchName,
      batchCourses: updatedBatch.batchCourses.map((course) => ({
        courseId: course.id,
        courseName: course.courseName,
      })),
      lastModify: updatedBatch.lastModify,
      createdAt: updatedBatch.createdAt,
      updatedAt: updatedBatch.updatedAt,
      isFinal: updatedBatch.isFinal,
      startDate: updatedBatch.startDate,
      endDate: updatedBatch.endDate,
      projectRequirements: updatedBatch.projectRequirements.map((field) => ({
        label: field.fieldName,
        type: field.fieldType,
        required: field.isRequired
      })),
    }
  } catch (error) {
    console.log("UPDATE BATCH: ",error);
    // transaction Rollback 
    await transaction.rollback();
    throw error;
  }
}