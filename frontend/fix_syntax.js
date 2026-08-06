const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

// The problematic block starts with: ) : activeTab === 'MY_COURSES' ? (
// and we need to make sure the ternary branches are properly enclosed.

// Actually, in React it's easier to just do:
// {loading ? (...) : activeTab === 'MY_COURSES' ? ( courses.length === 0 ? (...) : (...) ) : ( ... )}

// Let's replace it with a cleaner syntax.

let replacement = `            ) : activeTab === 'MY_COURSES' ? (
              courses.length === 0 ? (
                <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-16 text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-800/50 text-slate-600 mb-6">
                    <BookOpen className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">No courses yet</h3>
                  <p className="text-slate-400 max-w-md mx-auto mb-8">
                    Upload a PDF or DOCX textbook and let our AI generate a fully interactive, personalized coding course for you.
                  </p>
                  <button
                    onClick={onCreateNew}
                    className="inline-flex items-center px-6 py-3 font-bold text-emerald-400 border border-emerald-500/30 rounded-xl hover:bg-emerald-500/10 transition-colors"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Create your first course
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
`;

// It looks like I accidentally introduced this in my earlier diff:
//            ) : activeTab === 'MY_COURSES' ? (
//              courses.length === 0 ? (
// ...
//              ) : (
//                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

// So let's write a script to fix the exact lines around 410.
