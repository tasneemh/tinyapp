const { assert } = require('chai');
const { getUserByEmail, emailExists, urlsForUser} = require('../helpers');
const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a userID with valid email',()=>{
    const userID = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.equal(userID, expectedOutput);
  });
  it('should return undefined for an invalid email',()=>{
    const userID = getUserByEmail("tara@example.com", testUsers);
    const expectedOutput = undefined;
    assert.equal(userID, expectedOutput);
  });
});

describe('emailExists', function() {
  it('should return true when email exists',()=>{
    const bool = emailExists(testUsers, "user@example.com");
    const expectedOutput = true;
    assert.equal(bool, expectedOutput);
  });
  it('should return false when email does not exist',()=>{
    const bool = emailExists(testUsers, "tara@example.com");
    const expectedOutput = false;
    assert.equal(bool, expectedOutput);
  });
});

const testUrls = {
  'gsdhg': {
    longURL: 'http://www.bing.com',
    userID: 'max'
  },
  'asdsf': {
    longURL: 'http://www.yahoo.com',
    userID: 'mini'
  },
  'tyei': {
    longURL: 'http://www.facebook.com',
    userID: 'max'
  }
};
describe('urlsForUser', function() {
  it('should return objects containing urls for a valid user',()=>{
    const userURLS = urlsForUser(testUrls, "max");
    const expectedOutput = {
      'gsdhg': {
        longURL: 'http://www.bing.com',
        userID: 'max'
      },
      'tyei': {
        longURL: 'http://www.facebook.com',
        userID: 'max'
      }
    };
    assert.deepEqual(userURLS, expectedOutput);
  });
  it('should return an empty object for non existent user',()=>{
    const userURLS = urlsForUser(testUrls, "tara");
    const expectedOutput = {};
    assert.deepEqual(userURLS, expectedOutput);
  });
});