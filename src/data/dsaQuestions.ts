export type DsaDifficulty = "Easy" | "Medium";
export type DsaTopic =
  | "Array"
  | "String"
  | "Two Pointer"
  | "HashMap"
  | "Stack"
  | "Binary Search"
  | "DP";

export type DsaQuestion = {
  topic: DsaTopic;
  difficulty: DsaDifficulty;
  title: string;
  question: string;
};

export const DSA_QUESTIONS: DsaQuestion[] = [
  {
    topic: "DP",
    difficulty: "Easy",
    title: "Climbing Stairs",
    question: `Title: Climbing Stairs

Difficulty: Easy

Problem:
You are climbing a staircase with n steps.
Each time you can climb either 1 or 2 steps. Return the number of distinct ways to reach the top.

Example 1:
Input: n = 2
Output: 2
Explanation: There are two ways: 1+1 and 2.

Example 2:
Input: n = 3
Output: 3
Explanation: There are three ways: 1+1+1, 1+2, and 2+1.

Constraints:
- 1 <= n <= 45

Function Signature:
Java:
class Solution {
    public int climbStairs(int n) {
        
    }
}

Runner Code:
public class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
        System.out.println(sol.climbStairs(2));
        System.out.println(sol.climbStairs(3));
    }
}`,
  },

  {
    topic: "Array",
    difficulty: "Easy",
    title: "Maximum Subarray",
    question: `Title: Maximum Subarray

Difficulty: Easy

Problem:
Given an integer array nums, find the contiguous subarray with the largest sum and return its sum.
The subarray must contain at least one element.

Example 1:
Input: nums = [-2,1,-3,4,-1,2,1,-5,4]
Output: 6
Explanation: The subarray [4,-1,2,1] has the largest sum 6.

Example 2:
Input: nums = [1]
Output: 1
Explanation: The largest subarray contains only one element.

Constraints:
- 1 <= nums.length <= 10000
- -10000 <= nums[i] <= 10000

Function Signature:
Java:
class Solution {
    public int maxSubArray(int[] nums) {
        
    }
}

Runner Code:
public class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
        System.out.println(sol.maxSubArray(new int[]{-2,1,-3,4,-1,2,1,-5,4}));
        System.out.println(sol.maxSubArray(new int[]{1}));
    }
}`,
  },

  {
    topic: "Array",
    difficulty: "Easy",
    title: "Running Sum of 1D Array",
    question: `Title: Running Sum of 1D Array

Difficulty: Easy

Problem:
Given an integer array nums, return the running sum of nums.
The running sum at index i is the sum of all elements from index 0 to index i.

Example 1:
Input: nums = [1,2,3,4]
Output: [1, 3, 6, 10]
Explanation: Running sum is [1, 1+2, 1+2+3, 1+2+3+4].

Example 2:
Input: nums = [1,1,1,1,1]
Output: [1, 2, 3, 4, 5]
Explanation: Each position stores the prefix sum.

Constraints:
- 1 <= nums.length <= 10000
- -100000 <= nums[i] <= 100000

Function Signature:
Java:
class Solution {
    public int[] runningSum(int[] nums) {
        
    }
}

Runner Code:
import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
        System.out.println(Arrays.toString(sol.runningSum(new int[]{1,2,3,4})));
        System.out.println(Arrays.toString(sol.runningSum(new int[]{1,1,1,1,1})));
    }
}`,
  },

  {
    topic: "HashMap",
    difficulty: "Easy",
    title: "Two Sum",
    question: `Title: Two Sum

Difficulty: Easy

Problem:
Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target.
You may assume that each input has exactly one solution.

Example 1:
Input: nums = [2,7,11,15], target = 9
Output: [0, 1]
Explanation: nums[0] + nums[1] = 9.

Example 2:
Input: nums = [3,2,4], target = 6
Output: [1, 2]
Explanation: nums[1] + nums[2] = 6.

Constraints:
- 2 <= nums.length <= 10000
- -100000 <= nums[i] <= 100000
- Exactly one valid answer exists.

Function Signature:
Java:
class Solution {
    public int[] twoSum(int[] nums, int target) {
        
    }
}

Runner Code:
import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
        System.out.println(Arrays.toString(sol.twoSum(new int[]{2,7,11,15}, 9)));
        System.out.println(Arrays.toString(sol.twoSum(new int[]{3,2,4}, 6)));
    }
}`,
  },

  {
    topic: "HashMap",
    difficulty: "Easy",
    title: "Contains Duplicate",
    question: `Title: Contains Duplicate

Difficulty: Easy

Problem:
Given an integer array nums, return true if any value appears at least twice in the array.
Return false if every element is distinct.

Example 1:
Input: nums = [1,2,3,1]
Output: true
Explanation: The number 1 appears two times.

Example 2:
Input: nums = [1,2,3,4]
Output: false
Explanation: All elements are distinct.

Constraints:
- 1 <= nums.length <= 10000
- -100000 <= nums[i] <= 100000

Function Signature:
Java:
class Solution {
    public boolean containsDuplicate(int[] nums) {
        
    }
}

Runner Code:
public class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
        System.out.println(sol.containsDuplicate(new int[]{1,2,3,1}));
        System.out.println(sol.containsDuplicate(new int[]{1,2,3,4}));
    }
}`,
  },

  {
    topic: "Stack",
    difficulty: "Easy",
    title: "Valid Parentheses",
    question: `Title: Valid Parentheses

Difficulty: Easy

Problem:
Given a string s containing only brackets, determine if the input string is valid.
A string is valid if every opening bracket is closed by the same type of bracket in the correct order.

Example 1:
Input: s = "()"
Output: true
Explanation: The opening bracket is closed correctly.

Example 2:
Input: s = "(]"
Output: false
Explanation: The opening and closing brackets do not match.

Constraints:
- 1 <= s.length <= 10000
- s contains only '(', ')', '{', '}', '[' and ']'.

Function Signature:
Java:
class Solution {
    public boolean isValid(String s) {
        
    }
}

Runner Code:
public class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
        System.out.println(sol.isValid("()"));
        System.out.println(sol.isValid("(]"));
    }
}`,
  },

  {
    topic: "Binary Search",
    difficulty: "Easy",
    title: "Search Insert Position",
    question: `Title: Search Insert Position

Difficulty: Easy

Problem:
Given a sorted array of distinct integers and a target value, return the index if the target is found.
If not found, return the index where it would be inserted in order.

Example 1:
Input: nums = [1,3,5,6], target = 5
Output: 2
Explanation: Target 5 is found at index 2.

Example 2:
Input: nums = [1,3,5,6], target = 2
Output: 1
Explanation: Target 2 should be inserted at index 1.

Constraints:
- 1 <= nums.length <= 10000
- nums contains distinct values sorted in ascending order.

Function Signature:
Java:
class Solution {
    public int searchInsert(int[] nums, int target) {
        
    }
}

Runner Code:
public class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
        System.out.println(sol.searchInsert(new int[]{1,3,5,6}, 5));
        System.out.println(sol.searchInsert(new int[]{1,3,5,6}, 2));
    }
}`,
  },

  {
    topic: "Two Pointer",
    difficulty: "Easy",
    title: "Valid Palindrome",
    question: `Title: Valid Palindrome

Difficulty: Easy

Problem:
Given a string s, return true if it is a palindrome after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters.
Otherwise, return false.

Example 1:
Input: s = "A man, a plan, a canal: Panama"
Output: true
Explanation: After cleaning, it becomes "amanaplanacanalpanama", which is a palindrome.

Example 2:
Input: s = "race a car"
Output: false
Explanation: After cleaning, it becomes "raceacar", which is not a palindrome.

Constraints:
- 1 <= s.length <= 100000
- s contains printable ASCII characters.

Function Signature:
Java:
class Solution {
    public boolean isPalindrome(String s) {
        
    }
}

Runner Code:
public class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
        System.out.println(sol.isPalindrome("A man, a plan, a canal: Panama"));
        System.out.println(sol.isPalindrome("race a car"));
    }
}`,
  },

  {
    topic: "String",
    difficulty: "Easy",
    title: "Reverse Words in a String",
    question: `Title: Reverse Words in a String

Difficulty: Easy

Problem:
Given a string s containing words separated by spaces, return a string with the words in reverse order.
Remove extra spaces so that words are separated by a single space.

Example 1:
Input: s = "the sky is blue"
Output: "blue is sky the"
Explanation: The words are reversed.

Example 2:
Input: s = "  hello world  "
Output: "world hello"
Explanation: Extra spaces are removed.

Constraints:
- 1 <= s.length <= 10000
- s contains English letters and spaces.

Function Signature:
Java:
class Solution {
    public String reverseWords(String s) {
        
    }
}

Runner Code:
public class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
        System.out.println(sol.reverseWords("the sky is blue"));
        System.out.println(sol.reverseWords("  hello world  "));
    }
}`,
  },

  {
    topic: "Array",
    difficulty: "Medium",
    title: "Product of Array Except Self",
    question: `Title: Product of Array Except Self

Difficulty: Medium

Problem:
Given an integer array nums, return an array answer such that answer[i] is the product of all elements of nums except nums[i].
You must solve it without using division.

Example 1:
Input: nums = [1,2,3,4]
Output: [24, 12, 8, 6]
Explanation: Each index contains the product of all other elements.

Example 2:
Input: nums = [-1,1,0,-3,3]
Output: [0, 0, 9, 0, 0]
Explanation: Only the index with zero gets the product of non-zero values.

Constraints:
- 2 <= nums.length <= 10000
- -30 <= nums[i] <= 30
- The product fits in a 32-bit integer.

Function Signature:
Java:
class Solution {
    public int[] productExceptSelf(int[] nums) {
        
    }
}

Runner Code:
import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
        System.out.println(Arrays.toString(sol.productExceptSelf(new int[]{1,2,3,4})));
        System.out.println(Arrays.toString(sol.productExceptSelf(new int[]{-1,1,0,-3,3})));
    }
}`,
  },

  {
    topic: "Two Pointer",
    difficulty: "Medium",
    title: "Container With Most Water",
    question: `Title: Container With Most Water

Difficulty: Medium

Problem:
Given an integer array height, where each value represents the height of a vertical line, find two lines that together with the x-axis contain the most water.
Return the maximum amount of water.

Example 1:
Input: height = [1,8,6,2,5,4,8,3,7]
Output: 49
Explanation: The maximum area is formed between height[1] and height[8].

Example 2:
Input: height = [1,1]
Output: 1
Explanation: The only two lines form area 1.

Constraints:
- 2 <= height.length <= 10000
- 0 <= height[i] <= 10000

Function Signature:
Java:
class Solution {
    public int maxArea(int[] height) {
        
    }
}

Runner Code:
public class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
        System.out.println(sol.maxArea(new int[]{1,8,6,2,5,4,8,3,7}));
        System.out.println(sol.maxArea(new int[]{1,1}));
    }
}`,
  },
];